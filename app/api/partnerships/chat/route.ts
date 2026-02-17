import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServiceSupabaseClient } from '@/app/lib/supabase-server';

const anthropic = new Anthropic();

async function fetchDatabaseContext() {
  const client = getServiceSupabaseClient();

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

function buildSystemPrompt(context: Awaited<ReturnType<typeof fetchDatabaseContext>>): string {
  return `You are a helpful assistant for the Panini America Partnerships team. You answer questions about the partnership database — athletes, contracts, marketing obligations, completed activities, team partnerships, and partner partnerships.

Be concise, accurate, and helpful. When listing data, use short bullet points. If the data doesn't contain the answer, say so honestly.

Here is the current database state:

## Athletes (${context.athletes.length} total)
${JSON.stringify(context.athletes, null, 2)}

## Contracts (${context.contracts.length} total)
${JSON.stringify(context.contracts, null, 2)}

## Marketing Obligations (${context.obligations.length} total)
${JSON.stringify(context.obligations, null, 2)}

## Recent Completed Activities (last 50)
${JSON.stringify(context.recentActivities, null, 2)}

## Team Partnerships (${context.teamPartnerships.length} total)
${JSON.stringify(context.teamPartnerships, null, 2)}

## Partner Partnerships (${context.partnerPartnerships.length} total)
${JSON.stringify(context.partnerPartnerships, null, 2)}

When referencing athletes and contracts, cross-reference the athlete_id on contracts with the athlete id to provide names. Same for contract_id on obligations and activities.`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = (await request.json()) as {
      message: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
        { status: 500 },
      );
    }

    const context = await fetchDatabaseContext();
    const systemPrompt = buildSystemPrompt(context);

    const messages: Anthropic.MessageParam[] = [
      ...(history ?? []).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return NextResponse.json({ reply: text });
  } catch (err: unknown) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
