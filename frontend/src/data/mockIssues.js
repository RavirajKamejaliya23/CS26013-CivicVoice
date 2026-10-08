export const CATEGORIES = [
  { id: 'all', label: 'All Issues', icon: 'Layers' },
  { id: 'roads_potholes', label: 'Roads & Potholes', icon: 'Car', color: 'amber' },
  { id: 'garbage_sanitation', label: 'Solid Waste & Sanitation', icon: 'Trash2', color: 'rose' },
  { id: 'streetlights_power', label: 'Street Lighting & Power', icon: 'Lightbulb', color: 'yellow' },
  { id: 'water_drainage', label: 'Water Supply & Drainage', icon: 'Droplets', color: 'blue' },
  { id: 'public_infrastructure', label: 'Parks & Public Infra', icon: 'Building2', color: 'emerald' },
  { id: 'traffic_safety', label: 'Traffic Safety & Signage', icon: 'ShieldAlert', color: 'indigo' },
];

export const STATUS_CONFIG = {
  reported: {
    label: 'Reported',
    bg: 'bg-amber-100 dark:bg-amber-950/70',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
    dot: 'bg-amber-500',
    step: 1
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-orange-100 dark:bg-orange-950/70',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
    step: 2
  },
  accepted: {
    label: 'Accepted',
    bg: 'bg-blue-100 dark:bg-blue-950/70',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
    dot: 'bg-blue-500',
    step: 3
  },
  in_progress: {
    label: 'Work In Progress',
    bg: 'bg-purple-100 dark:bg-purple-950/70',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700',
    dot: 'bg-purple-500 animate-pulse',
    step: 4
  },
  completed: {
    label: 'Completed (Pending Verification)',
    bg: 'bg-teal-100 dark:bg-teal-950/70',
    text: 'text-teal-800 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-700',
    dot: 'bg-teal-500',
    step: 5
  },
  citizen_verified: {
    label: 'Citizen Verified',
    bg: 'bg-emerald-100 dark:bg-emerald-950/70',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    dot: 'bg-emerald-500',
    step: 6
  },
  reopened: {
    label: 'Reopened by Citizen',
    bg: 'bg-rose-100 dark:bg-rose-950/70',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
    dot: 'bg-rose-500 animate-ping',
    step: 4
  }
};

export const INITIAL_ISSUES = [
  {
    id: 'CV-VAD-2026-1001',
    title: 'Pothole near the school entrance on Gotri Road',
    description: 'A 2-foot wide hazardous pothole has opened near the school entrance on Gotri Road after monsoon rains. School vans and two-wheelers are swerving dangerously.',
    category: 'roads_potholes',
    status: 'in_progress',
    address: 'Near Gotri Road Primary School, Gotri, Ward 6',
    latitude: 22.3168,
    longitude: 73.1495,
    reportedBy: {
      name: 'Rohan Patel',
      badge: 'Active Citizen (Ward 6)',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    upvotes: 14,
    hasUpvoted: false,
    mergedCount: 1,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered by Citizen',
        date: 'Oct 06, 2026 • 09:15 AM',
        author: 'Rohan Patel',
        role: 'Citizen Reporter',
        note: 'Pothole registered on Gotri Road with photograph and GPS location.'
      },
      {
        status: 'under_review',
        title: 'Triage & Department Inspection Assigned',
        date: 'Oct 06, 2026 • 11:30 AM',
        author: 'Amit Patel',
        role: 'Executive Engineer',
        note: 'Inspected site on Gotri Road. Graded Priority 1 (School Zone Hazard).'
      },
      {
        status: 'in_progress',
        title: 'Work in Progress - Road Squad Mobilized',
        date: 'Oct 07, 2026 • 08:45 AM',
        author: 'Amit Patel',
        role: 'Roads & Infrastructure',
        note: 'Hot-mix asphalt patch squad deployed. Safety cones and barricades placed.'
      }
    ]
  },
  {
    id: 'CV-VAD-2026-1004',
    title: 'Garbage accumulation near the residential lane in Manjalpur',
    description: 'Municipal solid waste has not been collected for three consecutive days. Stray cattle and dogs are scattering waste across the road.',
    category: 'garbage_sanitation',
    status: 'reported',
    address: 'Residential Lane near Darbar Chowk, Manjalpur, Ward 9',
    latitude: 22.2682,
    longitude: 73.1953,
    reportedBy: {
      name: 'Mehul Desai',
      badge: 'Resident (Manjalpur)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    upvotes: 8,
    hasUpvoted: false,
    mergedCount: 1,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered by Citizen',
        date: 'Oct 07, 2026 • 07:30 AM',
        author: 'Mehul Desai',
        role: 'Citizen Reporter',
        note: 'Solid waste accumulation reported with photo.'
      }
    ]
  },
  {
    id: 'CV-VAD-2026-1006',
    title: 'Streetlight not working near the bus stop in Fatehgunj',
    description: 'Two overhead streetlamp fixtures failed outside the main Fatehgunj bus stop. Pedestrians and university students feel unsafe walking after dark.',
    category: 'streetlights_power',
    status: 'accepted',
    address: 'Near Fatehgunj Bus Stop, Fatehgunj Main Bazaar, Ward 2',
    latitude: 22.3224,
    longitude: 73.1865,
    reportedBy: {
      name: 'Aisha Khan',
      badge: 'Resident (Fatehgunj)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    upvotes: 11,
    hasUpvoted: false,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered by Citizen',
        date: 'Oct 06, 2026 • 08:00 PM',
        author: 'Aisha Khan',
        role: 'Citizen Reporter',
        note: 'Non-functional lamps reported at bus stop.'
      },
      {
        status: 'accepted',
        title: 'Work Order #WO-STL-412 Issued',
        date: 'Oct 07, 2026 • 10:00 AM',
        author: 'Amit Patel',
        role: 'Municipal Officer',
        note: 'Bucket truck and LED drivers scheduled for night shift replacement.'
      }
    ]
  },
  {
    id: 'CV-VAD-2026-1007',
    title: 'Blocked drainage causing waterlogging after rainfall near Alkapuri underpass',
    description: 'Underground storm water drain is heavily clogged with silt and plastic debris. Rainwater causes 1-foot waterlogging near the Alkapuri underpass entrance.',
    category: 'water_drainage',
    status: 'in_progress',
    address: 'Underpass approach road, RC Dutt Road, Alkapuri, Ward 5',
    latitude: 22.3106,
    longitude: 73.1704,
    reportedBy: {
      name: 'Rahul Mehta',
      badge: 'Resident (Alkapuri)',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    upvotes: 19,
    hasUpvoted: true,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered by Citizen',
        date: 'Oct 07, 2026 • 11:20 AM',
        author: 'Rahul Mehta',
        role: 'Citizen Reporter',
        note: 'Severe drainage blockage logged.'
      },
      {
        status: 'in_progress',
        title: 'Drainage Squad Active',
        date: 'Oct 08, 2026 • 09:15 AM',
        author: 'Harsh Desai',
        role: 'Storm Water Drainage',
        note: 'Suction jetting machine active at underpass culvert.'
      }
    ]
  },
  {
    id: 'CV-VAD-2026-1008',
    title: 'Broken footpath tiles near Sayajigunj market area',
    description: 'Damaged paver blocks and broken kerbstone tiles along the market promenade were causing tripping accidents among senior citizens.',
    category: 'public_infrastructure',
    status: 'citizen_verified',
    address: 'Sayajigunj Market Footpath, near Tower Circle, Ward 4',
    latitude: 22.3108,
    longitude: 73.1874,
    reportedBy: {
      name: 'Rohan Patel',
      badge: 'Active Citizen (Ward 6)',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '4 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    completionEvidenceUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    upvotes: 24,
    hasUpvoted: true,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered',
        date: 'Oct 04, 2026 • 08:30 AM',
        author: 'Rohan Patel',
        role: 'Citizen Reporter',
        note: 'Broken paver tiles flagged.'
      },
      {
        status: 'completed',
        title: 'Footpath Re-tiled & Compacted',
        date: 'Oct 06, 2026 • 04:00 PM',
        author: 'Amit Patel',
        role: 'Roads & Infrastructure',
        note: 'Paver blocks relaid with interlocking border and cement wash.',
        evidenceImage: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'
      },
      {
        status: 'citizen_verified',
        title: 'Citizen Certified Resolution',
        date: 'Oct 07, 2026 • 10:15 AM',
        author: 'Rohan Patel',
        role: 'Community Verifier',
        note: 'Inspected footpath in person. Walkway is smooth and safe for pedestrians.'
      }
    ]
  },
  {
    id: 'CV-VAD-2026-1009',
    title: 'Water pipeline leakage near the residential society on Waghodia Road',
    description: 'Potable water pipeline has cracked underground, wasting clean municipal drinking water and creating a muddy slush corridor in the residential society entrance.',
    category: 'water_drainage',
    status: 'in_progress',
    address: 'Near Shivalik Society, Waghodia Road, Ward 8',
    latitude: 22.2952,
    longitude: 73.2268,
    reportedBy: {
      name: 'Rohan Patel',
      badge: 'Active Citizen (Ward 6)',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    upvotes: 15,
    hasUpvoted: true,
    timeline: [
      {
        status: 'reported',
        title: 'Pipeline Breach Reported',
        date: 'Oct 07, 2026 • 06:45 AM',
        author: 'Rohan Patel',
        role: 'Citizen Reporter',
        note: 'Drinking water pipeline cracked under curb.'
      },
      {
        status: 'in_progress',
        title: 'Excavation & Valve Isolation Active',
        date: 'Oct 08, 2026 • 11:00 AM',
        author: 'Amit Patel',
        role: 'Water Supply Department',
        note: 'Line isolated. Collar clamp replacement in progress.'
      }
    ]
  },
  {
    id: 'CV-VAD-2026-1010',
    title: 'Damaged road divider near Akota main junction',
    description: 'Concrete median blocks were dislodged by a vehicle collision, exposing rebar steel spikes at the busy intersection.',
    category: 'traffic_safety',
    status: 'reported',
    address: 'Akota Main Junction Divider, Stadium Road, Ward 7',
    latitude: 22.2965,
    longitude: 73.1672,
    reportedBy: {
      name: 'Priya Shah',
      badge: 'Civic Steward (Gotri)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '5 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    upvotes: 7,
    hasUpvoted: false,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered',
        date: 'Today • 03:30 PM',
        author: 'Priya Shah',
        role: 'Citizen Reporter',
        note: 'Exposed rebar median hazard reported.'
      }
    ]
  },
  {
    id: 'CV-VAD-2026-1016',
    title: 'Streetlight pole wiring exposed near Karelibaug circle',
    description: 'Lower maintenance junction hatch cover is missing on street lighting pole with exposed 230V wiring at child height.',
    category: 'streetlights_power',
    status: 'reopened',
    address: 'Karelibaug Circle, near electrical feeder pillar, Ward 3',
    latitude: 22.3235,
    longitude: 73.1950,
    reportedBy: {
      name: 'Neha Joshi',
      badge: 'Active Resident (Karelibaug)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '3 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    upvotes: 13,
    hasUpvoted: false,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered',
        date: 'Oct 05, 2026',
        author: 'Neha Joshi',
        role: 'Citizen Reporter',
        note: 'Exposed junction box wiring on pole.'
      },
      {
        status: 'completed',
        title: 'Cover Screwed',
        date: 'Oct 06, 2026',
        author: 'Amit Patel',
        role: 'Street Lighting',
        note: 'Protective cover secured with screw latch.'
      },
      {
        status: 'reopened',
        title: 'Reopened by Citizen Inspection',
        date: 'Oct 07, 2026',
        author: 'Neha Joshi',
        role: 'Citizen Verifier',
        note: 'Cover screw came loose within 24 hours. Exposed wire still dangerously accessible to children.'
      }
    ]
  }
];
