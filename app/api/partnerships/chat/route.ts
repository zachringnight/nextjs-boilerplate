import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServiceSupabaseClient, parseBearerToken, getUserFromBearerToken } from '@/app/lib/supabase-server';

const anthropic = new Anthropic();

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-user, resets on server restart)
// ---------------------------------------------------------------------------

const MAX_REQUESTS_PER_MINUTE = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_MINUTE) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Input constraints
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

function db() {
  return getServiceSupabaseClient();
}

async function fetchDatabaseContext() {
  const client = db();

  const [athletes, contracts, obligations, activities, teamPartnerships, partnerPartnerships] =
    await Promise.all([
      client.from('athletes').select('id, name, sport, league, team').order('name'),
      client
        .from('athlete_contracts')
        .select('id, athlete_id, deal_type, exclusivity_scope, contract_start, contract_end, special_notes'),
      client
        .from('marketing_obligations')
        .select('id, contract_id, obligation_type, quantity_per_year, quantity_total, platform, notes'),
      client
        .from('completed_activities')
        .select('id, contract_id, activity_description, activity_date, activity_year')
        .order('activity_date', { ascending: false })
        .limit(50),
      client.from('team_partnerships').select('*').order('team_name'),
      client.from('partner_partnerships').select('*').order('partner_name'),
    ]);

  return {
    athletes: athletes.data ?? [],
    contracts: contracts.data ?? [],
    obligations: obligations.data ?? [],
    recentActivities: activities.data ?? [],
    teamPartnerships: teamPartnerships.data ?? [],
    partnerPartnerships: partnerPartnerships.data ?? [],
  };
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const tools: Anthropic.Tool[] = [
  // --- Athletes ---
  {
    name: 'create_athlete',
    description: 'Create a new athlete in the database.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Full name of the athlete' },
        sport: { type: 'string', description: 'Sport (Basketball, Football, Baseball, Soccer, Tennis, Volleyball)', nullable: true },
        league: { type: 'string', description: 'League (e.g. NBA, NFL, MLB)', nullable: true },
        team: { type: 'string', description: 'Current team name', nullable: true },
        instagram_handle: { type: 'string', nullable: true },
        x_handle: { type: 'string', nullable: true },
        team_city: { type: 'string', nullable: true },
        team_state: { type: 'string', nullable: true },
        hometown_city: { type: 'string', nullable: true },
        hometown_state: { type: 'string', nullable: true },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_athlete',
    description: 'Update an existing athlete. Only include fields that should change.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Athlete ID' },
        name: { type: 'string' },
        sport: { type: 'string', nullable: true },
        league: { type: 'string', nullable: true },
        team: { type: 'string', nullable: true },
        instagram_handle: { type: 'string', nullable: true },
        x_handle: { type: 'string', nullable: true },
        team_city: { type: 'string', nullable: true },
        team_state: { type: 'string', nullable: true },
        hometown_city: { type: 'string', nullable: true },
        hometown_state: { type: 'string', nullable: true },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_athlete',
    description: 'Delete an athlete by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Athlete ID' } },
      required: ['id'],
    },
  },
  // --- Contracts ---
  {
    name: 'create_contract',
    description: 'Create a new athlete contract.',
    input_schema: {
      type: 'object' as const,
      properties: {
        athlete_id: { type: 'number', description: 'ID of the athlete' },
        deal_type: { type: 'string', enum: ['exclusive', 'non_exclusive'] },
        exclusivity_scope: { type: 'string', nullable: true },
        contract_start: { type: 'string', description: 'Start date (YYYY-MM-DD)', nullable: true },
        contract_end: { type: 'string', description: 'End date (YYYY-MM-DD)', nullable: true },
        contract_end_note: { type: 'string', nullable: true },
        raw_marketing_specs: { type: 'string', nullable: true },
        raw_completed_marketing: { type: 'string', nullable: true },
        special_notes: { type: 'string', nullable: true },
      },
      required: ['athlete_id', 'deal_type'],
    },
  },
  {
    name: 'update_contract',
    description: 'Update an existing contract. Only include fields that should change.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Contract ID' },
        deal_type: { type: 'string', enum: ['exclusive', 'non_exclusive'] },
        exclusivity_scope: { type: 'string', nullable: true },
        contract_start: { type: 'string', nullable: true },
        contract_end: { type: 'string', nullable: true },
        contract_end_note: { type: 'string', nullable: true },
        raw_marketing_specs: { type: 'string', nullable: true },
        raw_completed_marketing: { type: 'string', nullable: true },
        special_notes: { type: 'string', nullable: true },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_contract',
    description: 'Delete a contract by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Contract ID' } },
      required: ['id'],
    },
  },
  // --- Obligations ---
  {
    name: 'create_obligation',
    description: 'Create a marketing obligation for a contract.',
    input_schema: {
      type: 'object' as const,
      properties: {
        contract_id: { type: 'number', description: 'Contract ID' },
        obligation_type: {
          type: 'string',
          description: 'Type of obligation',
          enum: [
            'appearance', 'draft_activation', 'game_worn_item', 'media_day',
            'memorabilia_signing', 'packaging_highlight', 'player_worn_jersey',
            'production_shoot', 'rated_rookie_series', 'social_post',
            'social_post_infeed', 'social_post_story', 'social_post_tweet',
            'super_bowl_appearance',
          ],
        },
        quantity_per_year: { type: 'number', nullable: true },
        quantity_total: { type: 'number', nullable: true },
        platform: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
      },
      required: ['contract_id', 'obligation_type'],
    },
  },
  {
    name: 'update_obligation',
    description: 'Update an existing obligation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Obligation ID' },
        obligation_type: { type: 'string' },
        quantity_per_year: { type: 'number', nullable: true },
        quantity_total: { type: 'number', nullable: true },
        platform: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_obligation',
    description: 'Delete an obligation by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Obligation ID' } },
      required: ['id'],
    },
  },
  // --- Completed Activities ---
  {
    name: 'create_activity',
    description: 'Log a completed activity for a contract.',
    input_schema: {
      type: 'object' as const,
      properties: {
        contract_id: { type: 'number', description: 'Contract ID' },
        activity_description: { type: 'string', description: 'What was completed' },
        activity_date: { type: 'string', description: 'Date (YYYY-MM-DD)', nullable: true },
        activity_year: { type: 'number', description: 'Year of the activity', nullable: true },
      },
      required: ['contract_id', 'activity_description'],
    },
  },
  {
    name: 'delete_activity',
    description: 'Delete a completed activity by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Activity ID' } },
      required: ['id'],
    },
  },
  // --- Conditional Bonuses ---
  {
    name: 'create_bonus',
    description: 'Create a conditional bonus for a contract.',
    input_schema: {
      type: 'object' as const,
      properties: {
        contract_id: { type: 'number', description: 'Contract ID' },
        trigger_event: { type: 'string', description: 'Event that triggers the bonus' },
        obligation: { type: 'string', description: 'What the athlete must do', nullable: true },
        bonus_amount: { type: 'number', description: 'Dollar amount', nullable: true },
      },
      required: ['contract_id', 'trigger_event'],
    },
  },
  {
    name: 'delete_bonus',
    description: 'Delete a conditional bonus by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Bonus ID' } },
      required: ['id'],
    },
  },
  // --- Team Partnerships ---
  {
    name: 'create_team_partnership',
    description: 'Create a new team partnership.',
    input_schema: {
      type: 'object' as const,
      properties: {
        team_name: { type: 'string' },
        league: { type: 'string', nullable: true },
        asset_type: { type: 'string', description: 'Type of partnership asset' },
        details: { type: 'string', nullable: true },
        activation_date: { type: 'string', description: 'Date (YYYY-MM-DD)', nullable: true },
        status: { type: 'string', nullable: true },
      },
      required: ['team_name', 'asset_type'],
    },
  },
  {
    name: 'delete_team_partnership',
    description: 'Delete a team partnership by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Team partnership ID' } },
      required: ['id'],
    },
  },
  // --- Partner Partnerships ---
  {
    name: 'create_partner_partnership',
    description: 'Create a new partner partnership.',
    input_schema: {
      type: 'object' as const,
      properties: {
        partner_name: { type: 'string' },
        asset_type: { type: 'string', description: 'Type of partnership asset' },
        details: { type: 'string', nullable: true },
        activation_date: { type: 'string', description: 'Date (YYYY-MM-DD)', nullable: true },
        status: { type: 'string', nullable: true },
      },
      required: ['partner_name', 'asset_type'],
    },
  },
  {
    name: 'delete_partner_partnership',
    description: 'Delete a partner partnership by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'number', description: 'Partner partnership ID' } },
      required: ['id'],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool executor
// ---------------------------------------------------------------------------

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  const client = db();

  switch (name) {
    // --- Athletes ---
    case 'create_athlete': {
      const { data, error } = await client.from('athletes').insert({
        name: input.name,
        sport: input.sport ?? null,
        league: input.league ?? null,
        team: input.team ?? null,
        instagram_handle: input.instagram_handle ?? null,
        x_handle: input.x_handle ?? null,
        team_city: input.team_city ?? null,
        team_state: input.team_state ?? null,
        hometown_city: input.hometown_city ?? null,
        hometown_state: input.hometown_state ?? null,
      }).select().single();
      if (error) return `Error: ${error.message}`;
      return `Created athlete "${data.name}" with ID ${data.id}.`;
    }
    case 'update_athlete': {
      const { id, ...fields } = input;
      const { error } = await client.from('athletes')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id as number);
      if (error) return `Error: ${error.message}`;
      return `Updated athlete ID ${id}.`;
    }
    case 'delete_athlete': {
      const { error } = await client.from('athletes').delete().eq('id', input.id as number);
      if (error) return `Error: ${error.message}`;
      return `Deleted athlete ID ${input.id}.`;
    }

    // --- Contracts ---
    case 'create_contract': {
      const { data, error } = await client.from('athlete_contracts').insert({
        athlete_id: input.athlete_id,
        deal_type: input.deal_type,
        exclusivity_scope: input.exclusivity_scope ?? null,
        contract_start: input.contract_start ?? null,
        contract_end: input.contract_end ?? null,
        contract_end_note: input.contract_end_note ?? null,
        raw_marketing_specs: input.raw_marketing_specs ?? null,
        raw_completed_marketing: input.raw_completed_marketing ?? null,
        special_notes: input.special_notes ?? null,
      }).select().single();
      if (error) return `Error: ${error.message}`;
      return `Created contract ID ${data.id} for athlete ID ${input.athlete_id}.`;
    }
    case 'update_contract': {
      const { id, ...fields } = input;
      const { error } = await client.from('athlete_contracts')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id as number);
      if (error) return `Error: ${error.message}`;
      return `Updated contract ID ${id}.`;
    }
    case 'delete_contract': {
      const { error } = await client.from('athlete_contracts').delete().eq('id', input.id as number);
      if (error) return `Error: ${error.message}`;
      return `Deleted contract ID ${input.id}.`;
    }

    // --- Obligations ---
    case 'create_obligation': {
      const { data, error } = await client.from('marketing_obligations').insert({
        contract_id: input.contract_id,
        obligation_type: input.obligation_type,
        quantity_per_year: input.quantity_per_year ?? null,
        quantity_total: input.quantity_total ?? null,
        platform: input.platform ?? null,
        notes: input.notes ?? null,
      }).select().single();
      if (error) return `Error: ${error.message}`;
      return `Created obligation ID ${data.id} (${input.obligation_type}) for contract ID ${input.contract_id}.`;
    }
    case 'update_obligation': {
      const { id, ...fields } = input;
      const { error } = await client.from('marketing_obligations').update(fields).eq('id', id as number);
      if (error) return `Error: ${error.message}`;
      return `Updated obligation ID ${id}.`;
    }
    case 'delete_obligation': {
      const { error } = await client.from('marketing_obligations').delete().eq('id', input.id as number);
      if (error) return `Error: ${error.message}`;
      return `Deleted obligation ID ${input.id}.`;
    }

    // --- Activities ---
    case 'create_activity': {
      const { data, error } = await client.from('completed_activities').insert({
        contract_id: input.contract_id,
        activity_description: input.activity_description,
        activity_date: input.activity_date ?? null,
        activity_year: input.activity_year ?? null,
      }).select().single();
      if (error) return `Error: ${error.message}`;
      return `Logged activity ID ${data.id} for contract ID ${input.contract_id}.`;
    }
    case 'delete_activity': {
      const { error } = await client.from('completed_activities').delete().eq('id', input.id as number);
      if (error) return `Error: ${error.message}`;
      return `Deleted activity ID ${input.id}.`;
    }

    // --- Bonuses ---
    case 'create_bonus': {
      const { data, error } = await client.from('conditional_bonuses').insert({
        contract_id: input.contract_id,
        trigger_event: input.trigger_event,
        obligation: input.obligation ?? null,
        bonus_amount: input.bonus_amount ?? null,
      }).select().single();
      if (error) return `Error: ${error.message}`;
      return `Created bonus ID ${data.id} for contract ID ${input.contract_id}.`;
    }
    case 'delete_bonus': {
      const { error } = await client.from('conditional_bonuses').delete().eq('id', input.id as number);
      if (error) return `Error: ${error.message}`;
      return `Deleted bonus ID ${input.id}.`;
    }

    // --- Team Partnerships ---
    case 'create_team_partnership': {
      const { data, error } = await client.from('team_partnerships').insert({
        team_name: input.team_name,
        league: input.league ?? null,
        asset_type: input.asset_type,
        details: input.details ?? null,
        activation_date: input.activation_date ?? null,
        status: input.status ?? null,
      }).select().single();
      if (error) return `Error: ${error.message}`;
      return `Created team partnership ID ${data.id} for ${input.team_name}.`;
    }
    case 'delete_team_partnership': {
      const { error } = await client.from('team_partnerships').delete().eq('id', input.id as number);
      if (error) return `Error: ${error.message}`;
      return `Deleted team partnership ID ${input.id}.`;
    }

    // --- Partner Partnerships ---
    case 'create_partner_partnership': {
      const { data, error } = await client.from('partner_partnerships').insert({
        partner_name: input.partner_name,
        asset_type: input.asset_type,
        details: input.details ?? null,
        activation_date: input.activation_date ?? null,
        status: input.status ?? null,
      }).select().single();
      if (error) return `Error: ${error.message}`;
      return `Created partner partnership ID ${data.id} for ${input.partner_name}.`;
    }
    case 'delete_partner_partnership': {
      const { error } = await client.from('partner_partnerships').delete().eq('id', input.id as number);
      if (error) return `Error: ${error.message}`;
      return `Deleted partner partnership ID ${input.id}.`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

function buildSystemPrompt(context: Awaited<ReturnType<typeof fetchDatabaseContext>>): string {
  return `You are a helpful assistant for the Panini America Partnerships team. You can both answer questions about the partnership database AND make changes to it using the tools provided.

## Capabilities
- **Read**: Answer questions about athletes, contracts, obligations, activities, and partnerships.
- **Write**: Create, update, and delete records using the provided tools.

## Guidelines
- Be concise and accurate. Use short bullet points when listing data.
- When the user asks you to add, change, or remove data, use the appropriate tool right away.
- After making a change, confirm what you did in plain language.
- If the user's request is ambiguous (e.g. which athlete?), ask a clarifying question before making changes.
- For delete operations, confirm the record details before deleting (e.g. "I'll delete athlete John Smith (ID 42). Let me do that now.").
- Cross-reference athlete_id on contracts with athlete id to provide names. Same for contract_id on obligations and activities.
- If the data doesn't contain what the user needs, say so honestly.

## Current Database State

### Athletes (${context.athletes.length} total)
${JSON.stringify(context.athletes, null, 2)}

### Contracts (${context.contracts.length} total)
${JSON.stringify(context.contracts, null, 2)}

### Marketing Obligations (${context.obligations.length} total)
${JSON.stringify(context.obligations, null, 2)}

### Recent Completed Activities (last 50)
${JSON.stringify(context.recentActivities, null, 2)}

### Team Partnerships (${context.teamPartnerships.length} total)
${JSON.stringify(context.teamPartnerships, null, 2)}

### Partner Partnerships (${context.partnerPartnerships.length} total)
${JSON.stringify(context.partnerPartnerships, null, 2)}`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

const MAX_TOOL_ROUNDS = 5;

export async function POST(request: NextRequest) {
  try {
    // --- Authentication ---
    const token = parseBearerToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const user = await getUserFromBearerToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }

    // --- Rate limiting ---
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before trying again.' },
        { status: 429 },
      );
    }

    const { message, history } = (await request.json()) as {
      message: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
        { status: 500 },
      );
    }

    const context = await fetchDatabaseContext();
    const systemPrompt = buildSystemPrompt(context);

    // Truncate history to prevent unbounded token growth
    const trimmedHistory = (history ?? []).slice(-MAX_HISTORY_MESSAGES);

    const messages: Anthropic.MessageParam[] = [
      ...trimmedHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Agentic tool-use loop
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    });

    let rounds = 0;
    while (response.stop_reason === 'tool_use' && rounds < MAX_TOOL_ROUNDS) {
      rounds++;

      // Collect tool results
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = await executeTool(block.name, block.input as Record<string, unknown>);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }
      }

      // Continue conversation with tool results
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages,
      });
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return NextResponse.json({ reply: text });
  } catch (err: unknown) {
    console.error('Chat API error:', err);
    const errMsg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
