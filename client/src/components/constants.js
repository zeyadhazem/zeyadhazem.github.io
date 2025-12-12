export const projects = [
  {
    id: 1,
    title: 'Apple Intelligence',
    subtitle: 'Media Architecture Leadership',
    description:
      "Led media architecture for Apple Intelligence as tech lead for an 11-person team focused on music and video. Collaborated with over 15 partner teams to design and drive internal adoption of a new developer API that will power the future of Siri, replacing SiriKit.",
    highlights: [
      'Tech lead for 11-person team',
      'Collaborated with 15+ partner teams',
      'Designed next-generation Siri API',
      'Replaced legacy SiriKit framework'
    ],
    model: '/iphone_16_pro_max.glb',
    scale: 1.5, // Made iPhone larger
    position: [0, 0, 0], // Centered position for iPhone
    color: '#ccaa00',
    year: '2024'
  },
  {
    id: 2,
    title: 'HomePod Evolution',
    subtitle: 'WWDC 2023 Feature',
    description:
      'Drove a key HomePod update at WWDC 2023, expanding playback from 8 to 100+ third-party apps using intelligent AirPlay. This breakthrough made HomePod more flexible and was featured by major tech publications including Macworld, The Verge, and MacRumors.',
    highlights: [
      'Expanded from 8 to 100+ apps',
      'Intelligent AirPlay technology',
      'Featured at WWDC 2023',
      'Personalized app selection'
    ],
    model: '/apple_homepod_2.glb',
    scale: 12.0, // Made HomePod much larger
    position: [0, -0.8, 0], // Adjusted Y position to center the larger HomePod
    color: '#30d158',
    year: '2023'
  },
];

export const experience = [
  {
    id: 1,
    company: 'Apple',
    role: 'Senior Software Engineer',
    period: '2021–Current',
    location: 'Cupertino, CA',
    achievements: [
      'Led media architecture for Apple Intelligence',
      'Drove HomePod update featured at WWDC 2023',
      'Designed cross-device media controls',
      'Created Apple Music Voice Plan'
    ]
  },
  {
    id: 2,
    company: 'Apple',
    role: 'Software Engineer',
    period: '2018–2021',
    location: 'Cupertino, CA',
    achievements: [
      'Developed Apple Music Voice Plan',
      'Built cross-device media controls',
      'Created log analysis tool saving thousands of hours',
      'Worked on Siri, HomeKit, and Communications teams'
    ]
  }
];