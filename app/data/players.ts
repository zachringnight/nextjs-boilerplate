export interface PlayerQuestion {
  station: 'field' | 'social' | 'vnr' | 'packRip';
  questions: string[];
}

export interface Player {
  id: string;
  name: string;
  subtitle: string;
  group: number;
  groupTime: string;
  playerNumber: number;
  questions: PlayerQuestion[];
}

export const players: Player[] = [
  {
    id: 'ally-watt',
    name: 'ALLY WATT',
    subtitle: 'COLORADO RAPIDS',
    group: 1,
    groupTime: '9:00 - 10:20 AM',
    playerNumber: 1,
    questions: [
      {
        station: 'field',
        questions: [
          'Pro soccer is coming home to Colorado — what does that moment mean to you?',
          'Everyone talks about your speed. When does it feel most dangerous?',
          "If we're freezing one Ally Watt moment for your Panini card — what's the shot?",
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Finish it: "Playing at home in Colorado means…"',
          'Three words. Your game. Go.',
          'Best fan moment so far this year?',
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "There's a kid in Denver watching you right now dreaming of this — what do you tell her?",
          "Women's soccer is having a moment. What does it feel like to be part of it?",
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          "Little Ally rips a pack and pulls… herself. What's going through her head?",
          'One career moment on your card forever — what is it?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'kaleigh-kurtz',
    name: 'KALEIGH KURTZ',
    subtitle: 'DEFENDER',
    group: 1,
    groupTime: '9:00 - 10:20 AM',
    playerNumber: 2,
    questions: [
      {
        station: 'field',
        questions: [
          'Consistency is your superpower. What does "showing up every single day" actually look like?',
          "Center backs do the work nobody sees. What's the part of your job fans would be surprised by?",
          'Panini is making the ultimate defender card — what HAS to be on it?',
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Minute 90, tied game. One word for your mindset.',
          'What do you love most about being in this league right now?',
          'Card photo: mid-tackle, post-clean sheet, or portrait? Pick one.',
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Young defenders get told to "just kick it." What do you wish someone told YOU?',
          "What's the pride of anchoring the back line at this level?",
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'First time you held a card with your face on it — what was that moment like?',
          'If Panini captured one defensive masterclass moment, what should it be?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'manaka-matsukubo',
    name: 'MANAKA MATSUKUBO',
    subtitle: 'JAPAN / NWSL',
    group: 1,
    groupTime: '9:00 - 10:20 AM',
    playerNumber: 3,
    questions: [
      {
        station: 'field',
        questions: [
          'You play with so much joy — where does that come from?',
          'Your chemistry with teammates is electric. What makes it click?',
          "Dream Panini card shot: what's the scene?",
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Your style in three words — go!',
          "Favorite thing about NWSL culture you didn't expect?",
          'Best American food discovery so far?',
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "There's a girl in Tokyo watching NWSL for the first time because of you — what's your message?",
          'What makes representing Japan on this stage special?',
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Did you grow up with sticker albums or trading cards in Japan?',
          'One moment that screams "Manaka" for a card — what is it?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'kenza-dali',
    name: 'KENZA DALI',
    subtitle: 'FRANCE / NWSL',
    group: 2,
    groupTime: '10:30 - 11:50 AM',
    playerNumber: 4,
    questions: [
      {
        station: 'field',
        questions: [
          'Your football has a signature style. How would you describe it?',
          'What drew you to the NWSL and what keeps you here?',
          "If we're capturing the perfect Kenza Dali card photo — what's the vibe?",
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          "Game day sneakers — what's the energy today?",
          'If your card had a tagline, what would it say?',
          'How do you reset after a tough match?',
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "To the young players watching from France and around the world — what's your message?",
          "You've seen women's football grow across continents. What excites you most right now?",
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'You appreciate craftsmanship. What makes something actually worth collecting?',
          'One career moment immortalized on a card — what is it?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'mia-fishel',
    name: 'MIA FISHEL',
    subtitle: 'FORWARD',
    group: 2,
    groupTime: '10:30 - 11:50 AM',
    playerNumber: 5,
    questions: [
      {
        station: 'field',
        questions: [
          'You built your path your own way. What does it mean to bring fans along on that journey?',
          "When you're at your best, what do your highlights say about you?",
          'The iconic Mia Fishel card shot — describe it.',
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          '"Big Fish Energy" — define it in one sentence.',
          'Favorite way to connect with fans?',
          "Signature celebration — what's the move?",
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Your brand is YOU. What do you want kids to take from your story?',
          "What makes this moment in women's soccer feel different?",
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'First time seeing yourself on a trading card — walk us through that feeling.',
          'Dream card design: bold and loud, clean and classic, or something wild?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'mina-tanaka',
    name: 'MINA TANAKA',
    subtitle: 'JAPAN / UTAH',
    group: 2,
    groupTime: '10:30 - 11:50 AM',
    playerNumber: 6,
    questions: [
      {
        station: 'field',
        questions: [
          'NWSL fans are just getting to know you — what do you want them to see?',
          'The build-up, the finish, the celebration — which part is YOUR favorite?',
          'Signature Mina Tanaka moment for a Panini card — what is it?',
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'One word for your playing style.',
          'Favorite thing about Utah so far?',
          'Best part of matchday?',
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'What does it mean to represent Japan here and connect fans across the world?',
          "To the young collectors just starting — what's your message?",
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Sticker albums, trading cards — were you into collecting growing up in Japan?',
          'A fan in Tokyo pulls your Panini card — what does that mean to you?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'casey-murphy',
    name: 'CASEY MURPHY',
    subtitle: 'GOALKEEPER / USWNT',
    group: 2,
    groupTime: '10:30 - 11:50 AM',
    playerNumber: 7,
    questions: [
      {
        station: 'field',
        questions: [
          'Goalkeepers set the tone for everything. What do you want your presence to say?',
          'Representing your club AND the national team — what does that responsibility feel like?',
          'The ultimate goalkeeper Panini card — what details have to be on it?',
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Goalkeeper mindset in three words.',
          "What's your favorite part of signing autographs for fans?",
          'One word for the goalkeeper sisterhood.',
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "To every young keeper out there dreaming big — what do you want them to hear?",
          "What makes being a goalkeeper in women's soccer right now feel special?",
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Were you a card collector growing up?',
          'A young goalkeeper pulls your card — what do you hope they feel?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'ivonne-chacon',
    name: 'IVONNE CHACON',
    subtitle: 'COLOMBIA / CHICAGO',
    group: 3,
    groupTime: '1:00 - 2:20 PM',
    playerNumber: 8,
    questions: [
      {
        station: 'field',
        questions: [
          'Representing Colombia in the NWSL — what does that mean to you and to fans back home?',
          'What do you want Chicago to know about the energy you bring?',
          "Your story in one card image — what's the moment?",
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Three words: your playing style.',
          'Message to young girls watching in Colombia?',
          'Best part about playing in front of fans here?',
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "Colombian women's football is on the rise. What does this moment mean?",
          "Fans in Bogotá will be proud to collect your card — what do you want to say to them?",
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'World Cup sticker albums are LEGENDARY in Colombia. Were you a sticker kid?',
          "A young fan in Medellín pulls your Panini card — what does that moment mean?",
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'temwa-chawinga',
    name: 'TEMWA CHAWINGA',
    subtitle: 'MALAWI / KANSAS CITY',
    group: 3,
    groupTime: '1:00 - 2:20 PM',
    playerNumber: 9,
    questions: [
      {
        station: 'field',
        questions: [
          "You're representing an entire continent. What does that responsibility feel like?",
          'When kids watch you play, what do you want them to feel?',
          'If Panini captures your legacy in one image — what does it show?',
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Your name means "love." What does that mean to you on the pitch?',
          'Favorite thing about Kansas City?',
          'Best way to celebrate a goal?',
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "To every young player in Africa dreaming of this stage — what's your message?",
          'What does it mean to see African players celebrated on a global stage like this?',
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Imagine little Temwa ripping a pack and pulling a Malawian player. What would that have meant?',
          'Message to young collectors across Africa?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'jordyn-bloomer',
    name: 'JORDYN BLOOMER',
    subtitle: 'GOALKEEPER',
    group: 3,
    groupTime: '1:00 - 2:20 PM',
    playerNumber: 10,
    questions: [
      {
        station: 'field',
        questions: [
          'Big moments find you. What does it feel like to step up and deliver?',
          'What do you love MOST about being a goalkeeper?',
          'Goalkeeper highlight card for Jordyn Bloomer — what moment does it celebrate?',
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          "Tell us about your signature celebration — what's the story?",
          'Goalkeeper energy in one sentence.',
          "Coolest autograph moment you've had with a fan?",
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Young goalkeepers are watching you. What do you want them to know?',
          "What makes this moment in women's soccer feel so big?",
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'First time you saw your name on a checklist or card — what was that like?',
          'If you could pick your card photo, what moment would it capture?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
  {
    id: 'riley-tiernan',
    name: 'RILEY TIERNAN',
    subtitle: 'ANGEL CITY',
    group: 3,
    groupTime: '1:00 - 2:20 PM',
    playerNumber: 11,
    questions: [
      {
        station: 'field',
        questions: [
          'Your rise has been electric. What do you want fans to know about the joy you play with?',
          'Angel City supporters bring the energy — what does playing in front of them feel like?',
          '"Welcome to the league" Panini card — what moment should it be?',
          'Name your dream Panini insert',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Jersey to LA — favorite new LA discovery?',
          'Best part about being in the NWSL?',
          'Your game in three words.',
          "Stickers or trading cards — which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "To every young player dreaming of this league — what's your message?",
          'What does connecting with fans through autographs and collecting mean to you?',
          "What does being part of Panini's collecting culture mean?",
          'One line for collectors',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Were you a card collector growing up?',
          'A young fan pulls your rookie card — what do you hope that moment feels like for them?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to collectors chasing your card',
        ],
      },
    ],
  },
];

export const rotationSchedule = {
  group1: {
    name: 'GROUP 1',
    time: '9:00 AM - 10:20 AM',
    players: ['Ally Watt', 'Kaleigh Kurtz', 'Manaka Matsukubo'],
    schedule: [
      { time: '9:00', field: 'Ally', social: 'Kaleigh', vnr: 'Manaka', packRip: '—' },
      { time: '9:20', field: 'Kaleigh', social: 'Manaka', vnr: '—', packRip: 'Ally' },
      { time: '9:40', field: 'Manaka', social: '—', vnr: 'Ally', packRip: 'Kaleigh' },
      { time: '10:00', field: '—', social: 'Ally', vnr: 'Kaleigh', packRip: 'Manaka' },
    ],
  },
  group2: {
    name: 'GROUP 2',
    time: '10:30 AM - 11:50 AM',
    players: ['Kenza Dali', 'Mia Fishel', 'Mina Tanaka', 'Casey Murphy'],
    schedule: [
      { time: '10:30', field: 'Kenza', social: 'Mia', vnr: 'Mina', packRip: 'Casey' },
      { time: '10:50', field: 'Mia', social: 'Mina', vnr: 'Casey', packRip: 'Kenza' },
      { time: '11:10', field: 'Mina', social: 'Casey', vnr: 'Kenza', packRip: 'Mia' },
      { time: '11:30', field: 'Casey', social: 'Kenza', vnr: 'Mia', packRip: 'Mina' },
    ],
  },
  group3: {
    name: 'GROUP 3',
    time: '1:00 PM - 2:20 PM',
    players: ['Ivonne Chacon', 'Temwa Chawinga', 'Jordyn Bloomer', 'Riley Tiernan'],
    schedule: [
      { time: '1:00', field: 'Ivonne', social: 'Temwa', vnr: 'Jordyn', packRip: 'Riley' },
      { time: '1:20', field: 'Temwa', social: 'Jordyn', vnr: 'Riley', packRip: 'Ivonne' },
      { time: '1:40', field: 'Jordyn', social: 'Riley', vnr: 'Ivonne', packRip: 'Temwa' },
      { time: '2:00', field: 'Riley', social: 'Ivonne', vnr: 'Temwa', packRip: 'Jordyn' },
    ],
  },
};

export const genericBanks = {
  worldCupSticker: {
    title: 'WORLD CUP STICKER ALBUM',
    questions: [
      'Did you ever build a World Cup sticker album growing up?',
      'First sticker you really wanted?',
      '"Place it perfectly" or "close enough" person?',
      'Did you trade duplicates with friends or family?',
      "If you could be a sticker — what's the photo?",
    ],
  },
  tradingCard: {
    title: 'TRADING CARD',
    questions: [
      'What makes a card a keeper: photo, rarity, auto, or story?',
      'Card nickname or tagline — what would yours be?',
      'Design your own insert — name and look?',
      'One detail that HAS to be on your card photo?',
      'Message to collectors chasing your card this season?',
    ],
  },
  packRipReactions: {
    title: 'PACK RIP REACTIONS',
    questions: [
      'Call your shot: what are you hoping to pull?',
      'Talk through every card out loud — no silent flips!',
      'Pick "card of the pack" and give it a nickname.',
      'If you pull a teammate — what do you say about them?',
      "If you pull yourself — what's the reaction line?",
    ],
  },
};
