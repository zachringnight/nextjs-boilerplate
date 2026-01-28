export interface PlayerQuestion {
  station: 'field' | 'social' | 'vnr' | 'packRip';
  questions: string[];
}

export interface Player {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  pronunciation?: string;
  subtitle: string;
  position: string;
  team: string;
  nationality: string;
  flag: string;
  photo: string;
  group: number;
  groupTime: string;
  playerNumber: number;
  bio: string[];
  talkingPoints: string[];
  questions: PlayerQuestion[];
}

export const players: Player[] = [
  {
    id: 'ally-watt',
    name: 'ALLY WATT',
    firstName: 'Ally',
    lastName: 'Watt',
    subtitle: 'DENVER SUMMIT FC',
    position: 'Forward',
    team: 'Denver Summit FC',
    nationality: 'United States',
    flag: '🇺🇸',
    photo: '/players/ally-watt.jpg',
    group: 1,
    groupTime: '9:00 to 10:20 AM',
    playerNumber: 1,
    bio: [
      'Colorado native and first-ever Denver Summit FC signing',
      'Speed demon and fan favorite known for explosive runs',
      '2024 NWSL Champion with Orlando Pride',
      'Known for her work ethic and leadership on and off the pitch',
    ],
    talkingPoints: [
      'Hometown hero bringing pro soccer to Denver',
      'Speed is her weapon. One of the fastest in the league',
      'First player signed to Summit FC. Building something special',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Pro soccer is coming home to Colorado . What does that moment mean to you?',
          'Everyone talks about your speed. When does it feel most dangerous?',
          "If we're freezing one Ally Watt moment for your Panini card . What's the shot?",
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Finish it: "Playing at home in Colorado means…"',
          'Three words. Your game. Go.',
          'Best fan moment so far this year?',
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "There's a kid in Denver watching you right now dreaming of this . What do you tell her?",
          "Women's soccer is having a moment. What does it feel like to be part of it?",
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          "Little Ally rips a pack and pulls… herself. What's going through her head?",
          'One career moment on your card forever . What is it?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'kaleigh-kurtz',
    name: 'KALEIGH KURTZ',
    firstName: 'Kaleigh',
    lastName: 'Kurtz',
    pronunciation: 'KAY-lee KURTS',
    subtitle: 'DENVER SUMMIT FC',
    position: 'Center Back',
    team: 'Denver Summit FC',
    nationality: 'United States',
    flag: '🇺🇸',
    photo: '/players/kaleigh-kurtz.jpg',
    group: 1,
    groupTime: '9:00 to 10:20 AM',
    playerNumber: 2,
    bio: [
      'Two-time NWSL Champion joining Denver Summit FC for their inaugural season',
      'Rock-solid center back known for consistency and leadership',
      'NWSL ironwoman with incredible durability record',
      'Virginia Tech alum with a reputation for aerial dominance',
    ],
    talkingPoints: [
      'Helping build something new in Denver from day one',
      'Championship experience she brings to an expansion team',
      'Consistency is her superpower. Shows up every single game',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Consistency is your superpower. What does "showing up every single day" actually look like?',
          "Center backs do the work nobody sees. What's the part of your job fans would be surprised by?",
          'Panini is making the ultimate defender card . What HAS to be on it?',
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Minute 90, tied game. One word for your mindset.',
          'What do you love most about being in this league right now?',
          'Card photo: mid-tackle, post-clean sheet, or portrait? Pick one.',
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Young defenders get told to "just kick it." What do you wish someone told YOU?',
          "What's the pride of anchoring the back line at this level?",
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'When you finally hold a card with your face on it, what do you think that moment will feel like?',
          'If Panini captured one defensive masterclass moment, what should it be?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'manaka-matsukubo',
    name: 'MANAKA MATSUKUBO',
    firstName: 'Manaka',
    lastName: 'Matsukubo',
    pronunciation: 'mah-NAH-kah maht-soo-KOO-boh',
    subtitle: 'NC COURAGE',
    position: 'Midfielder',
    team: 'North Carolina Courage',
    nationality: 'Japan',
    flag: '🇯🇵',
    photo: '/players/manaka-matsukubo.jpg',
    group: 1,
    groupTime: '9:00 to 10:20 AM',
    playerNumber: 3,
    bio: [
      'Japanese international bringing flair and creativity to NWSL',
      'Known for joyful style of play and infectious energy',
      'Technical midfielder with exceptional vision',
      'Rising star connecting Japanese and American soccer cultures',
    ],
    talkingPoints: [
      'Joy is her trademark. Plays with visible happiness',
      'Represents growing Japan-NWSL pipeline',
      'Technical ability stands out even in a league full of talent',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'You play with so much joy. Where does that come from?',
          'Your chemistry with teammates is electric. What makes it click?',
          "Dream Panini card shot: what's the scene?",
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Your style in three words. Go!',
          "Favorite thing about NWSL culture you didn't expect?",
          'Best American food discovery so far?',
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "There's a girl in Tokyo watching NWSL for the first time because of you . What's your message?",
          'What makes representing Japan on this stage special?',
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Did you grow up with sticker albums or trading cards in Japan?',
          'One moment that screams "Manaka" for a card . What is it?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'kenza-dali',
    name: 'KENZA DALI',
    firstName: 'Kenza',
    lastName: 'Dali',
    pronunciation: 'KEN-zah DAH-lee',
    subtitle: 'SAN DIEGO WAVE',
    position: 'Midfielder',
    team: 'San Diego Wave',
    nationality: 'France',
    flag: '🇫🇷',
    photo: '/players/kenza-dali.jpg',
    group: 2,
    groupTime: '10:30 to 11:50 AM',
    playerNumber: 4,
    bio: [
      'French international and 2025 Midfielder of the Year finalist',
      'Veteran presence who has played across Europe\'s top leagues',
      'Known for vision, creativity, and set-piece delivery',
      'Key piece of San Diego Wave\'s midfield',
    ],
    talkingPoints: [
      'European pedigree. Played in France, England, now NWSL',
      'Set-piece specialist with a dangerous delivery',
      'Bringing international experience to San Diego',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Your football has a signature style. How would you describe it?',
          'What drew you to the NWSL and what keeps you here?',
          "If we're capturing the perfect Kenza Dali card photo . What's the vibe?",
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          "Game day sneakers . What's the energy today?",
          'If your card had a tagline, what would it say?',
          'How do you reset after a tough match?',
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "To the young players watching from France and around the world . What's your message?",
          "You've seen women's football grow across continents. What excites you most right now?",
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'You appreciate craftsmanship. What makes something actually worth collecting?',
          'One career moment immortalized on a card . What is it?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'mia-fishel',
    name: 'MIA FISHEL',
    firstName: 'Mia',
    lastName: 'Fishel',
    subtitle: 'SEATTLE REIGN',
    position: 'Forward',
    team: 'Seattle Reign',
    nationality: 'United States',
    flag: '🇺🇸',
    photo: '/players/mia-fishel.jpg',
    group: 2,
    groupTime: '10:30 to 11:50 AM',
    playerNumber: 5,
    bio: [
      'Dynamic forward with a unique path through Liga MX Femenil',
      'Known as "Big Fish". Built a brand around authentic self-expression',
      'Social media savvy with a devoted fanbase',
      'Goal scorer with flair and personality to match',
    ],
    talkingPoints: [
      '"Big Fish Energy" is her brand. Owns her confidence',
      'Blazed her own trail through Mexico before NWSL',
      'Highly engaged fanbase. Knows her audience',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'You built your path your own way. What does it mean to bring fans along on that journey?',
          "When you're at your best, what do your highlights say about you?",
          'The iconic Mia Fishel card shot. Describe it.',
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          '"Big Fish Energy". Define it in one sentence.',
          'Favorite way to connect with fans?',
          "Signature celebration . What's the move?",
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Your brand is YOU. What do you want kids to take from your story?',
          "What makes this moment in women's soccer feel different?",
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'When you see yourself on a Panini trading card for the first time, what do you think that will feel like?',
          'Dream card design: bold and loud, clean and classic, or something wild?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'mina-tanaka',
    name: 'MINA TANAKA',
    firstName: 'Mina',
    lastName: 'Tanaka',
    pronunciation: 'MEE-nah tah-NAH-kah',
    subtitle: 'JAPAN / UTAH',
    position: 'Forward',
    team: 'Utah Royals',
    nationality: 'Japan',
    flag: '🇯🇵',
    photo: '/players/mina-tanaka.jpg',
    group: 2,
    groupTime: '10:30 to 11:50 AM',
    playerNumber: 6,
    bio: [
      'Japanese international striker with clinical finishing',
      'Prolific scorer in Japan before joining NWSL',
      'Combines technical skill with intelligent movement',
      'Quiet demeanor masks fierce competitive fire',
    ],
    talkingPoints: [
      'Clinical finisher. Makes the hard chances look easy',
      'Growing Japanese presence in NWSL',
      'Utah\'s newest star building a following in the Mountain West',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'NWSL fans are just getting to know you . What do you want them to see?',
          'The build-up, the finish, the celebration. Which part is YOUR favorite?',
          'Signature Mina Tanaka moment for a Panini card . What is it?',
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'One word for your playing style.',
          'Favorite thing about Utah so far?',
          'Best part of matchday?',
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'What does it mean to represent Japan here and connect fans across the world?',
          "To young fans just getting into cards . What's your message?",
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Sticker albums, trading cards. Were you into collecting growing up in Japan?',
          'A fan in Tokyo pulls your Panini card . What does that mean to you?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'casey-murphy',
    name: 'CASEY MURPHY',
    firstName: 'Casey',
    lastName: 'Murphy',
    subtitle: 'BOSTON LEGACY',
    position: 'Goalkeeper',
    team: 'Boston Legacy',
    nationality: 'United States',
    flag: '🇺🇸',
    photo: '/players/casey-murphy.jpg',
    group: 2,
    groupTime: '10:30 to 11:50 AM',
    playerNumber: 7,
    bio: [
      '2024 Olympic gold medalist with USWNT',
      'Joining Boston Legacy for their inaugural NWSL season',
      'Shot-stopper with commanding presence in goal',
      'Rutgers alum who developed in France before returning to NWSL',
    ],
    talkingPoints: [
      'Olympic champion bringing winning culture to Boston',
      'National team goalkeeper. Represents the pinnacle',
      'Helping build something new with an expansion franchise',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Goalkeepers set the tone for everything. What do you want your presence to say?',
          'Representing your club AND the national team . What does that responsibility feel like?',
          'The ultimate goalkeeper Panini card . What details have to be on it?',
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Goalkeeper mindset in three words.',
          "What's your favorite part of signing autographs for fans?",
          'One word for the goalkeeper sisterhood.',
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "To every young keeper out there dreaming big . What do you want them to hear?",
          "What makes being a goalkeeper in women's soccer right now feel special?",
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Did you collect cards or stickers growing up?',
          'A young goalkeeper pulls your card . What do you hope they feel?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'ivonne-chacon',
    name: 'IVONNE CHACON',
    firstName: 'Ivonne',
    lastName: 'Chacon',
    pronunciation: 'ee-VON-nay chah-CONE',
    subtitle: 'CHICAGO RED STARS',
    position: 'Midfielder',
    team: 'Chicago Red Stars',
    nationality: 'Colombia',
    flag: '🇨🇴',
    photo: '/players/ivonne-chacon.jpg',
    group: 3,
    groupTime: '1:00 to 2:20 PM',
    playerNumber: 8,
    bio: [
      'Colombian international bringing South American flair to Chicago',
      'Dynamic midfielder with energy and creativity',
      'Represents the growing Latin American presence in NWSL',
      'Passionate about inspiring young girls back home in Colombia',
    ],
    talkingPoints: [
      'Colombian pride. Represents a nation passionate about football',
      'Sticker culture is HUGE in Colombia. World Cup albums are legendary',
      'Bridge between Colombian fans and NWSL',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Representing Colombia in the NWSL . What does that mean to you and to fans back home?',
          'What do you want Chicago to know about the energy you bring?',
          "Your story in one card image . What's the moment?",
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Three words: your playing style.',
          'Message to young girls watching in Colombia?',
          'Best part about playing in front of fans here?',
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "Colombian women's football is on the rise. What does this moment mean?",
          "Fans in Bogotá will be proud to collect your card . What do you want to say to them?",
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'World Cup sticker albums are LEGENDARY in Colombia. Were you a sticker kid?',
          "A young fan in Medellín pulls your Panini card . What does that moment mean?",
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'temwa-chawinga',
    name: 'TEMWA CHAWINGA',
    firstName: 'Temwa',
    lastName: 'Chawinga',
    pronunciation: 'TEM-wah chah-WING-gah',
    subtitle: 'MALAWI / KANSAS CITY',
    position: 'Forward',
    team: 'Kansas City Current',
    nationality: 'Malawi',
    flag: '🇲🇼',
    photo: '/players/temwa-chawinga.jpg',
    group: 3,
    groupTime: '1:00 to 2:20 PM',
    playerNumber: 9,
    bio: [
      'Malawian international and sister of Tabitha Chawinga',
      'Represents an entire continent in NWSL',
      'Name means "love" in Chichewa. Plays with heart',
      'Trailblazer for African women in professional soccer',
    ],
    talkingPoints: [
      'African representation matters. She carries a continent\'s hopes',
      'Sister duo with Tabitha. Family legacy in the sport',
      'Her name "Temwa" means love. Beautiful story angle',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          "You're representing an entire continent. What does that responsibility feel like?",
          'When kids watch you play, what do you want them to feel?',
          'If Panini captures your legacy in one image . What does it show?',
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Your name means "love." What does that mean to you on the pitch?',
          'Favorite thing about Kansas City?',
          'Best way to celebrate a goal?',
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "To every young player in Africa dreaming of this stage . What's your message?",
          'What does it mean to see African players celebrated on a global stage like this?',
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Imagine little Temwa ripping a pack and pulling a Malawian player. What would that have meant?',
          'Message to young fans across Africa?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'jordyn-bloomer',
    name: 'JORDYN BLOOMER',
    firstName: 'Jordyn',
    lastName: 'Bloomer',
    subtitle: 'GOALKEEPER',
    position: 'Goalkeeper',
    team: 'Racing Louisville',
    nationality: 'United States',
    flag: '🇺🇸',
    photo: '/players/jordyn-bloomer.jpg',
    group: 3,
    groupTime: '1:00 to 2:20 PM',
    playerNumber: 10,
    bio: [
      'Rising goalkeeper making a name with clutch performances',
      'Big-game mentality. Thrives under pressure',
      'Known for signature celebration and personality',
      'Fan favorite with growing following',
    ],
    talkingPoints: [
      'Clutch performer. Big moments find her',
      'Personality stands out. Genuine and engaging',
      'Signature celebration worth capturing',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Big moments find you. What does it feel like to step up and deliver?',
          'What do you love MOST about being a goalkeeper?',
          'Goalkeeper highlight card for Jordyn Bloomer . What moment does it celebrate?',
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          "Tell us about your signature celebration . What's the story?",
          'Goalkeeper energy in one sentence.',
          "Coolest autograph moment you've had with a fan?",
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          'Young goalkeepers are watching you. What do you want them to know?',
          "What makes this moment in women's soccer feel so big?",
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'When you see your name on a Panini card for the first time, what will that moment mean to you?',
          'If you could pick your card photo, what moment would it capture?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
  {
    id: 'riley-tiernan',
    name: 'RILEY TIERNAN',
    firstName: 'Riley',
    lastName: 'Tiernan',
    subtitle: 'ANGEL CITY',
    position: 'Midfielder',
    team: 'Angel City FC',
    nationality: 'United States',
    flag: '🇺🇸',
    photo: '/players/riley-tiernan.jpg',
    group: 3,
    groupTime: '1:00 to 2:20 PM',
    playerNumber: 11,
    bio: [
      'Jersey native making waves in Los Angeles',
      'Electric young talent with fearless attacking style',
      'Angel City\'s rising star with a bright future',
      'Brings East Coast grit to West Coast soccer',
    ],
    talkingPoints: [
      'Rookie sensation. "Welcome to the league" energy',
      'Angel City fanbase is massive. Built in audience',
      'Jersey to LA journey. Interesting contrast',
    ],
    questions: [
      {
        station: 'field',
        questions: [
          'Your rise has been electric. What do you want fans to know about the joy you play with?',
          'Angel City supporters bring the energy . What does playing in front of them feel like?',
          '"Welcome to the league" Panini card . What moment should it be?',
          'If Panini made a special edition card for you, what would it look like?',
          'What do you want fans to feel pulling your card?',
        ],
      },
      {
        station: 'social',
        questions: [
          'Jersey to LA. Favorite new LA discovery?',
          'Best part about being in the NWSL?',
          'Your game in three words.',
          "Stickers or trading cards. Which one's your vibe?",
          'Card tagline in one sentence',
        ],
      },
      {
        station: 'vnr',
        questions: [
          "To every young player dreaming of this league . What's your message?",
          'What does connecting with fans through autographs and collecting mean to you?',
          "What does being part of Panini's collecting culture mean?",
          'One line for the fans',
        ],
      },
      {
        station: 'packRip',
        questions: [
          'Did you collect cards or stickers growing up?',
          'A young fan pulls your rookie card . What do you hope that moment feels like for them?',
          'Call your shot: what are you hoping to pull?',
          'Card of the pack + give it a nickname',
          'Message to fans who will be looking for your card',
        ],
      },
    ],
  },
];

export const rotationSchedule = {
  group1: {
    name: 'GROUP 1',
    time: '9:00 AM to 10:20 AM',
    players: ['Ally Watt', 'Kaleigh Kurtz', 'Manaka Matsukubo'],
    schedule: [
      { time: '9:00', field: 'Ally Watt', social: 'Kaleigh Kurtz', vnr: 'Manaka Matsukubo', packRip: 'BREAK' },
      { time: '9:20', field: 'Kaleigh Kurtz', social: 'Manaka Matsukubo', vnr: 'BREAK', packRip: 'Ally Watt' },
      { time: '9:40', field: 'Manaka Matsukubo', social: 'BREAK', vnr: 'Ally Watt', packRip: 'Kaleigh Kurtz' },
      { time: '10:00', field: 'BREAK', social: 'Ally Watt', vnr: 'Kaleigh Kurtz', packRip: 'Manaka Matsukubo' },
    ],
  },
  group2: {
    name: 'GROUP 2',
    time: '10:30 AM to 11:50 AM',
    players: ['Kenza Dali', 'Mia Fishel', 'Mina Tanaka', 'Casey Murphy'],
    schedule: [
      { time: '10:30', field: 'Kenza Dali', social: 'Mia Fishel', vnr: 'Mina Tanaka', packRip: 'Casey Murphy' },
      { time: '10:50', field: 'Mia Fishel', social: 'Mina Tanaka', vnr: 'Casey Murphy', packRip: 'Kenza Dali' },
      { time: '11:10', field: 'Mina Tanaka', social: 'Casey Murphy', vnr: 'Kenza Dali', packRip: 'Mia Fishel' },
      { time: '11:30', field: 'Casey Murphy', social: 'Kenza Dali', vnr: 'Mia Fishel', packRip: 'Mina Tanaka' },
    ],
  },
  group3: {
    name: 'GROUP 3',
    time: '1:00 PM to 2:20 PM',
    players: ['Ivonne Chacon', 'Temwa Chawinga', 'Jordyn Bloomer', 'Riley Tiernan'],
    schedule: [
      { time: '1:00', field: 'Ivonne Chacon', social: 'Temwa Chawinga', vnr: 'Jordyn Bloomer', packRip: 'Riley Tiernan' },
      { time: '1:20', field: 'Temwa Chawinga', social: 'Jordyn Bloomer', vnr: 'Riley Tiernan', packRip: 'Ivonne Chacon' },
      { time: '1:40', field: 'Jordyn Bloomer', social: 'Riley Tiernan', vnr: 'Ivonne Chacon', packRip: 'Temwa Chawinga' },
      { time: '2:00', field: 'Riley Tiernan', social: 'Ivonne Chacon', vnr: 'Temwa Chawinga', packRip: 'Jordyn Bloomer' },
    ],
  },
};

// Universal questions for each station (same for all players)
export const stationUniversalQuestions = {
  field: {
    title: 'FIELD: Hero Rollout',
    subtitle: 'On-camera prompts (not Q&A)',
    questions: [],
  },
  social: {
    title: 'PANINI PRODUCT + PARTNERSHIP',
    subtitle: 'Cards + Category Growth + Sticker Album',
    questions: [
      'What does it mean to be part of the first official Panini x NWSL partnership?',
      'When fans finally get to hold your Panini card, what do you hope they feel?',
      'What do you want fans to notice first when they see your card?',
      'If you could choose the photo on your card, what moment would you pick?',
      'What detail would you want on your card that feels personal to you?',
      'What moment from your game would translate best to a card and why?',
      'What makes it special that Panini is now telling NWSL stories through product?',
      'What does this partnership do for the league and for players in a real way?',
      'Why is this a big moment for women\'s soccer collecting?',
      'What would you want a dedicated fan to understand about the NWSL from your card?',
      'What\'s one thing about this league that deserves more spotlight in product storytelling?',
      'If a new fan discovers the NWSL through Panini, what do you hope they find?',
      'Did you grow up doing World Cup sticker albums?',
      'What did you love most about sticker albums: chasing, trading, or completing pages?',
      'What\'s your best sticker album memory?',
      'If you could be a World Cup style sticker, what would your pose be?',
      'What would it mean to be part of Panini\'s World Cup activations representing the NWSL?',
      'What\'s the connection between the World Cup global moment and the NWSL season?',
      'What does it mean knowing your card will be someone\'s first intro to you?',
      'Give us one line on why fans should be excited about this Panini partnership.',
    ],
  },
  vnr: {
    title: 'SOCIAL: Season Beats + Milestones',
    subtitle: 'Fun Seasonal Content (No All-Star)',
    questions: [
      'What are you most excited about for the 2026 season?',
      'What\'s your message to fans as the season kicks off?',
      'What\'s one goal you\'re chasing this year?',
      'What\'s one thing you worked on in the offseason that fans will notice?',
      'What does a great opening weekend look like for you and your team?',
      'Rivalry match energy: what makes those games special?',
      'What\'s your favorite part of playing in front of NWSL crowds?',
      'What\'s one moment you\'re hoping to create for fans this season?',
      'Midseason: what do you want your team to be known for by the halfway point?',
      'Late-season push: what helps your team finish strong?',
      'Playoff push: what\'s the energy like when every game matters?',
      'Playoffs: what does it take to win when the margins get tight?',
      'Championship: what would lifting the trophy mean to you?',
      'If you could send a quick message to your parents right now, what would you say?',
      'Halloween: what\'s your go-to candy, no hesitation?',
      'Thanksgiving: what\'s the one dish you have to have on your plate?',
      'Holiday season: what\'s your favorite holiday food or dessert?',
      'Christmas: what\'s the best present you ever got?',
      'Christmas: what\'s the best present you ever gave someone?',
      'One word for your mindset this year, and why?',
    ],
  },
  packRip: {
    title: 'VNR: Local News Soundbites',
    subtitle: 'Broadcast B-Roll (Positive Only, No Collecting)',
    questions: [
      'What should fans be most excited about in the NWSL this season?',
      'What are you most excited about personally going into this year?',
      'What makes the NWSL such a great league to watch right now?',
      'What do you love most about competing at this level?',
      'What does your team want to be known for this season?',
      'What\'s your favorite part of a game day in the NWSL?',
      'What\'s one thing fans will notice right away when they watch you play?',
      'What\'s the best way for new fans to jump into the NWSL this season?',
      'What makes NWSL crowds and environments special?',
      'What\'s one matchup or moment you\'re looking forward to this season?',
      'What does it take to prepare at a high level week after week?',
      'What\'s a skill you\'ve worked hard to improve that you\'re excited to show?',
      'What motivates you to keep getting better every season?',
      'What\'s something you\'re proud of about your journey as a pro?',
      'What do you enjoy most about representing your club and community?',
      'What\'s the most exciting part of the season when the stakes rise late?',
      'What does being part of this league mean to you?',
      'What do you want young players watching at home to take from your story?',
      'What would you say to fans who want a fun, high-energy sports experience?',
      'Give us one line that captures your excitement for this season.',
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
      "If you could be a sticker . What's the photo?",
    ],
  },
  tradingCard: {
    title: 'TRADING CARD',
    questions: [
      'What makes a card special to you: the photo, the autograph, or the story behind it?',
      'If your card had a nickname or tagline, what would it be?',
      'If Panini made a special edition card for you, what would it look like?',
      'One detail that HAS to be on your card photo?',
      'Message to fans who will be looking for your card this season?',
    ],
  },
  packRipReactions: {
    title: 'PACK RIP REACTIONS',
    questions: [
      'Call your shot: what are you hoping to pull?',
      'Talk through every card out loud. No silent flips!',
      'Pick "card of the pack" and give it a nickname.',
      'If you pull a teammate . What do you say about them?',
      "If you pull yourself . What's the reaction line?",
    ],
  },
};
