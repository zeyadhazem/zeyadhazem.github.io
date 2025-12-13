export const projects = [
  {
    id: 1,
    title: 'Apple Intelligence',
    subtitle: 'Media Architecture Leadership',
    description:
      "Led the media architecture for Apple Intelligence and an 11-person team focused on music and video. Designed the next-generation developer APIs set to replace SiriKit and power the future of Siri.",
    highlights: [
      'Tech lead for 11-person team',
      'Led cross-functional architecture decisions across 15+ teams',
      'Designed next-generation Siri API',
      'Replaced legacy SiriKit framework'
    ],
    model: '/iphone_16_pro_max.glb',
    scale: 1.5, // Made iPhone larger
    position: [0, 0, 0], // Centered position for iPhone
    cameraPosition: [0, 0, 5],
    color: '#ccaa00',
    year: '2024'
  },
  {
    id: 2,
    title: 'HomePod Evolution',
    subtitle: 'Edge Computing & On-Device Intelligence',
    description:
      'Drove key HomePod updates over multiple years, including expanding playback from 8 to 100+ third-party apps through intelligent AirPlay and introducing on-device machine learning to predict user music preferences, allowing Siri to default to preferred apps without manual configuration.',
    highlights: [
      'Expanded from 8 to 100+ apps',
      'Intelligent AirPlay technology',
      'Featured at WWDC 2023',
      'Personalized app selection'
    ],
    model: '/apple_homepod_2.glb',
    scale: 12.0, // Made HomePod much larger
    position: [0, -0.8, 0], // Adjusted Y position to center the larger HomePod
    cameraPosition: [0, 3, 3],
    color: '#30d158',
    year: '2023'
  },
  {
    id: 3,
    title: 'Smart Home Integration',
    subtitle: 'Connected Living Experience',
    description:
      'Led the development of multiple features enabling seamless integration across the Apple ecosystem in the home, such as controlling Apple TV via Siri on iPhone or smart speakers, and handing off media playback between devices.',
    highlights: [
      'Seamless device connectivity',
      'Intelligent automation systems',
      'Enhanced user experience',
      'Cross-platform compatibility'
    ],
    model: '/home.glb',
    scale: 2.0,
    position: [0, 0, 0],
    cameraPosition: [-10, -10, -10],
    color: '#007aff',
    year: '2024'
  },
];

export const experience = [
  {
    id: 1,
    company: 'Apple',
    role: 'Staff Software Engineer',
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