/**
 * PARTICIPANTS DATA TEMPLATE
 * ==========================
 * Copy this file to app/data/participants.ts and customize for your shoot.
 *
 * INSTRUCTIONS:
 * 1. Update the Participant interface if you need different fields
 * 2. Add all participants to the participants array
 * 3. Update the rotation schedule to match your groups
 * 4. Customize station questions for your event type
 */

// ============================================
// INTERFACES
// ============================================

/**
 * Station-specific questions for each participant
 */
export interface ParticipantQuestion {
  station: string; // Match station IDs from config.ts
  questions: string[];
}

/**
 * Main participant data structure
 */
export interface Participant {
  // Identity
  id: string; // URL-safe slug (e.g., 'jane-doe')
  name: string; // Display name (e.g., 'JANE DOE')
  firstName: string;
  lastName: string;
  pronunciation?: string; // Optional pronunciation guide

  // Display
  subtitle: string; // Secondary info line
  photo: string; // Path to photo in /public/participants/

  // Categorization
  position: string; // Role/position
  team: string; // Team/organization
  nationality: string;
  flag: string; // Emoji flag

  // Scheduling
  group: number; // Group number (1, 2, 3, etc.)
  groupTime: string; // Human-readable time slot
  participantNumber: number; // Order within shoot

  // Content
  bio: string[]; // 3-5 bullet points about them
  talkingPoints: string[]; // Key messages for interviewers
  questions: ParticipantQuestion[]; // Station-specific questions
}

// ============================================
// PARTICIPANT DATA
// ============================================

export const participants: Participant[] = [
  // ----------------------------------------
  // GROUP 1 PARTICIPANTS
  // ----------------------------------------
  {
    id: 'participant-one',
    name: 'PARTICIPANT ONE',
    firstName: 'Participant',
    lastName: 'One',
    pronunciation: 'par-TIS-ih-pant',
    subtitle: 'TEAM NAME',
    position: 'Position',
    team: 'Team Name',
    nationality: 'Country',
    flag: '🏳️',
    photo: '/participants/participant-one.jpg',
    group: 1,
    groupTime: '9:00 to 10:20 AM',
    participantNumber: 1,
    bio: [
      'First key fact about this participant',
      'Second interesting detail or achievement',
      'Third relevant background information',
      'Fourth point about personality or style',
    ],
    talkingPoints: [
      'Primary message or storyline to highlight',
      'Secondary angle or interesting hook',
      'Connection to event theme or partner',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Opening question about their journey?',
          'Question about their craft or skills?',
          'Visual/moment question for the shoot?',
          'What do you want fans to feel seeing this image?',
          'Final message or call-to-action?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Quick, punchy question for social clip?',
          'Fill-in-the-blank or word association?',
          'Fan engagement question?',
          'Product/partner tie-in question?',
          'One-liner tagline question?',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Broadcast-friendly question about the event?',
          'Aspirational message question?',
          'Partner integration question?',
          'Sign-off or message to fans?',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Nostalgia or personal connection question?',
          'Reaction prompt for the moment?',
          'Prediction or call-your-shot question?',
          'Pick your favorite and explain?',
          'Final message for collectors/fans?',
        ],
      },
    ],
  },
  {
    id: 'participant-two',
    name: 'PARTICIPANT TWO',
    firstName: 'Participant',
    lastName: 'Two',
    subtitle: 'TEAM NAME',
    position: 'Position',
    team: 'Team Name',
    nationality: 'Country',
    flag: '🏳️',
    photo: '/participants/participant-two.jpg',
    group: 1,
    groupTime: '9:00 to 10:20 AM',
    participantNumber: 2,
    bio: [
      'First key fact about this participant',
      'Second interesting detail or achievement',
      'Third relevant background information',
      'Fourth point about personality or style',
    ],
    talkingPoints: [
      'Primary message or storyline to highlight',
      'Secondary angle or interesting hook',
      'Connection to event theme or partner',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Opening question about their journey?',
          'Question about their craft or skills?',
          'Visual/moment question for the shoot?',
          'What do you want fans to feel seeing this image?',
          'Final message or call-to-action?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Quick, punchy question for social clip?',
          'Fill-in-the-blank or word association?',
          'Fan engagement question?',
          'Product/partner tie-in question?',
          'One-liner tagline question?',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Broadcast-friendly question about the event?',
          'Aspirational message question?',
          'Partner integration question?',
          'Sign-off or message to fans?',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Nostalgia or personal connection question?',
          'Reaction prompt for the moment?',
          'Prediction or call-your-shot question?',
          'Pick your favorite and explain?',
          'Final message for collectors/fans?',
        ],
      },
    ],
  },

  // ----------------------------------------
  // GROUP 2 PARTICIPANTS
  // ----------------------------------------
  {
    id: 'participant-three',
    name: 'PARTICIPANT THREE',
    firstName: 'Participant',
    lastName: 'Three',
    subtitle: 'TEAM NAME',
    position: 'Position',
    team: 'Team Name',
    nationality: 'Country',
    flag: '🏳️',
    photo: '/participants/participant-three.jpg',
    group: 2,
    groupTime: '10:30 to 11:50 AM',
    participantNumber: 3,
    bio: [
      'First key fact about this participant',
      'Second interesting detail or achievement',
      'Third relevant background information',
      'Fourth point about personality or style',
    ],
    talkingPoints: [
      'Primary message or storyline to highlight',
      'Secondary angle or interesting hook',
      'Connection to event theme or partner',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Opening question about their journey?',
          'Question about their craft or skills?',
          'Visual/moment question for the shoot?',
          'What do you want fans to feel seeing this image?',
          'Final message or call-to-action?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Quick, punchy question for social clip?',
          'Fill-in-the-blank or word association?',
          'Fan engagement question?',
          'Product/partner tie-in question?',
          'One-liner tagline question?',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Broadcast-friendly question about the event?',
          'Aspirational message question?',
          'Partner integration question?',
          'Sign-off or message to fans?',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Nostalgia or personal connection question?',
          'Reaction prompt for the moment?',
          'Prediction or call-your-shot question?',
          'Pick your favorite and explain?',
          'Final message for collectors/fans?',
        ],
      },
    ],
  },

  // ----------------------------------------
  // GROUP 3 PARTICIPANTS
  // ----------------------------------------
  {
    id: 'participant-four',
    name: 'PARTICIPANT FOUR',
    firstName: 'Participant',
    lastName: 'Four',
    subtitle: 'TEAM NAME',
    position: 'Position',
    team: 'Team Name',
    nationality: 'Country',
    flag: '🏳️',
    photo: '/participants/participant-four.jpg',
    group: 3,
    groupTime: '1:00 to 2:20 PM',
    participantNumber: 4,
    bio: [
      'First key fact about this participant',
      'Second interesting detail or achievement',
      'Third relevant background information',
      'Fourth point about personality or style',
    ],
    talkingPoints: [
      'Primary message or storyline to highlight',
      'Secondary angle or interesting hook',
      'Connection to event theme or partner',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Opening question about their journey?',
          'Question about their craft or skills?',
          'Visual/moment question for the shoot?',
          'What do you want fans to feel seeing this image?',
          'Final message or call-to-action?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Quick, punchy question for social clip?',
          'Fill-in-the-blank or word association?',
          'Fan engagement question?',
          'Product/partner tie-in question?',
          'One-liner tagline question?',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Broadcast-friendly question about the event?',
          'Aspirational message question?',
          'Partner integration question?',
          'Sign-off or message to fans?',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Nostalgia or personal connection question?',
          'Reaction prompt for the moment?',
          'Prediction or call-your-shot question?',
          'Pick your favorite and explain?',
          'Final message for collectors/fans?',
        ],
      },
    ],
  },
];

// ============================================
// ROTATION SCHEDULE
// ============================================

/**
 * Define the rotation schedule for each group.
 * Each slot shows which participant is at which station.
 * Use 'BREAK' for empty slots when groups have fewer participants than stations.
 */
export const rotationSchedule = {
  group1: {
    name: 'GROUP 1',
    time: '9:00 AM to 10:20 AM',
    participants: ['Participant One', 'Participant Two'],
    schedule: [
      {
        time: '9:00',
        field: 'Participant One',
        social: 'Participant Two',
        vnr: 'BREAK',
        packRip: 'BREAK',
      },
      {
        time: '9:20',
        field: 'Participant Two',
        social: 'BREAK',
        vnr: 'Participant One',
        packRip: 'BREAK',
      },
      {
        time: '9:40',
        field: 'BREAK',
        social: 'Participant One',
        vnr: 'Participant Two',
        packRip: 'BREAK',
      },
      {
        time: '10:00',
        field: 'BREAK',
        social: 'BREAK',
        vnr: 'BREAK',
        packRip: 'Participant One',
      },
    ],
  },
  group2: {
    name: 'GROUP 2',
    time: '10:30 AM to 11:50 AM',
    participants: ['Participant Three'],
    schedule: [
      {
        time: '10:30',
        field: 'Participant Three',
        social: 'BREAK',
        vnr: 'BREAK',
        packRip: 'BREAK',
      },
      {
        time: '10:50',
        field: 'BREAK',
        social: 'Participant Three',
        vnr: 'BREAK',
        packRip: 'BREAK',
      },
      {
        time: '11:10',
        field: 'BREAK',
        social: 'BREAK',
        vnr: 'Participant Three',
        packRip: 'BREAK',
      },
      {
        time: '11:30',
        field: 'BREAK',
        social: 'BREAK',
        vnr: 'BREAK',
        packRip: 'Participant Three',
      },
    ],
  },
  group3: {
    name: 'GROUP 3',
    time: '1:00 PM to 2:20 PM',
    participants: ['Participant Four'],
    schedule: [
      {
        time: '1:00',
        field: 'Participant Four',
        social: 'BREAK',
        vnr: 'BREAK',
        packRip: 'BREAK',
      },
      {
        time: '1:20',
        field: 'BREAK',
        social: 'Participant Four',
        vnr: 'BREAK',
        packRip: 'BREAK',
      },
      {
        time: '1:40',
        field: 'BREAK',
        social: 'BREAK',
        vnr: 'Participant Four',
        packRip: 'BREAK',
      },
      {
        time: '2:00',
        field: 'BREAK',
        social: 'BREAK',
        vnr: 'BREAK',
        packRip: 'Participant Four',
      },
    ],
  },
};

// ============================================
// UNIVERSAL STATION QUESTIONS
// ============================================

/**
 * Backup questions for each station that work for any participant.
 * Station managers can fall back to these if needed.
 */
export const stationUniversalQuestions = {
  field: {
    title: 'FIELD: Hero Content',
    subtitle: 'On-camera prompts',
    questions: [
      'What does this moment mean to you?',
      'Describe your journey to get here.',
      'What do you want fans to see in this image?',
      'One word to describe how you feel right now.',
    ],
  },
  social: {
    title: 'SOCIAL: Quick Hits',
    subtitle: 'Short-form content',
    questions: [
      'Quick message to your fans?',
      'Describe yourself in three words.',
      'Best advice you ever got?',
      'What makes you unique?',
      'Finish the sentence: "I play because..."',
    ],
  },
  vnr: {
    title: 'VNR: Broadcast Ready',
    subtitle: 'News-friendly soundbites',
    questions: [
      'What should fans be excited about?',
      'What does this partnership mean to you?',
      'Message to young fans watching?',
      'What makes this event special?',
    ],
  },
  packRip: {
    title: 'PACK RIP: Product Moment',
    subtitle: 'Authentic reactions',
    questions: [
      'Did you collect growing up?',
      'What are you hoping to find?',
      'Pick your favorite and tell us why.',
      'Message to collectors?',
    ],
  },
};

// ============================================
// GENERIC QUESTION BANKS
// ============================================

/**
 * Additional question banks for specific content types.
 * Use these for themed content or backup questions.
 */
export const genericBanks = {
  nostalgiaQuestions: {
    title: 'NOSTALGIA',
    questions: [
      'Favorite memory from when you started?',
      'Who inspired you growing up?',
      'What would you tell your younger self?',
      'Best piece of advice you received?',
      'Moment that changed everything for you?',
    ],
  },
  productQuestions: {
    title: 'PRODUCT/PARTNER',
    questions: [
      'What does this partnership mean to you?',
      'When fans see this product, what should they feel?',
      'What detail matters most to you in the design?',
      'Message to fans who will see this?',
      'One word to describe this moment?',
    ],
  },
  fanEngagement: {
    title: 'FAN ENGAGEMENT',
    questions: [
      'Message to your biggest supporters?',
      'Best fan interaction you have had?',
      'What do you want fans to know about you?',
      'How do you connect with fans?',
      'One thing fans might not know about you?',
    ],
  },
};
