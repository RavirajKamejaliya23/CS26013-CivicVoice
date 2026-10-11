export const CATEGORIES = [
  { id: 'all', label: 'All Issues', icon: 'Layers' },
  { id: 'roads_potholes', label: 'Roads & Potholes', icon: 'Car', color: 'amber' },
  { id: 'garbage_sanitation', label: 'Solid Waste & Sanitation', icon: 'Trash2', color: 'rose' },
  { id: 'streetlights_power', label: 'Street Lighting & Power', icon: 'Lightbulb', color: 'yellow' },
  { id: 'water_drainage', label: 'Water Supply & Drainage', icon: 'Droplets', color: 'blue' },
  { id: 'public_infrastructure', label: 'Parks & Public Infra', icon: 'Building2', color: 'emerald' },
  { id: 'traffic_safety', label: 'Traffic Safety & Signage', icon: 'ShieldAlert', color: 'indigo' },
  { id: 'other', label: 'Other', icon: 'HelpCircle', color: 'purple' },
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
    label: 'Accepted / Work Order',
    bg: 'bg-blue-100 dark:bg-blue-950/70',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
    dot: 'bg-blue-500',
    step: 3
  },
  in_progress: {
    label: 'In Progress (Crews Active)',
    bg: 'bg-purple-100 dark:bg-purple-950/70',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700',
    dot: 'bg-purple-500 animate-pulse',
    step: 4
  },
  completed: {
    label: 'Work Completed (Awaiting Verify)',
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
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-100 dark:bg-red-950/70',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-500',
    step: 0
  },
  duplicate: {
    label: 'Duplicate / Merged',
    bg: 'bg-stone-100 dark:bg-stone-800/80',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-300 dark:border-stone-600',
    dot: 'bg-stone-400',
    step: 0
  }
};

export const INITIAL_ISSUES = [
  {
    id: 'CV-DEMO-1001',
    isDemo: true,
    title: 'Deep road crater near school entrance on Gotri Road',
    description: 'A 2-foot wide hazardous pothole has opened near the primary school approach road. School transport vans and two-wheelers swerve into incoming traffic to avoid the crater.',
    category: 'roads_potholes',
    status: 'in_progress',
    address: 'Near Primary School, Gotri Road, Vadodara, Gujarat',
    latitude: 22.3168,
    longitude: 73.1495,
    reportedBy: {
      name: 'Rohan Patel',
      badge: 'Active Citizen · Vadodara',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    upvotes: 23,
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
    id: 'CV-DEMO-1002',
    isDemo: true,
    title: 'Overflowing commercial waste bin on Indiranagar 100ft Road',
    description: 'Municipal green bins outside commercial complex have not been cleared over the weekend. Waste spillage is blocking pedestrian walkway and creating sanitary issues.',
    category: 'garbage_sanitation',
    status: 'reported',
    address: '100ft Road, Near 12th Main, Indiranagar, Bengaluru, Karnataka',
    latitude: 12.9784,
    longitude: 77.6408,
    reportedBy: {
      name: 'Priya Iyer',
      badge: 'Civic Steward · Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: 'Yesterday • 08:20 AM',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    upvotes: 14,
    hasUpvoted: false,
    mergedCount: 0,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered',
        date: 'Oct 09, 2026 • 08:20 AM',
        author: 'Priya Iyer',
        role: 'Citizen Reporter',
        note: 'Commercial waste bin overflow reported with geo-tagged photograph.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1003',
    isDemo: true,
    title: 'Multiple non-functional streetlights on SV Road corridor',
    description: 'Four consecutive LED luminaires are dark near the metro station exit on SV Road. Dense pedestrian crossing lacks illumination after 7 PM.',
    category: 'streetlights_power',
    status: 'accepted',
    address: 'SV Road, Near Metro Station Exit 2, Andheri West, Mumbai, Maharashtra',
    latitude: 19.1197,
    longitude: 72.8468,
    reportedBy: {
      name: 'Vikram Malhotra',
      badge: 'Resident · Mumbai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '3 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    upvotes: 31,
    hasUpvoted: true,
    mergedCount: 2,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered',
        date: 'Oct 05, 2026 • 09:10 PM',
        author: 'Vikram Malhotra',
        role: 'Citizen Reporter',
        note: 'Streetlamps failed along 120-meter corridor.'
      },
      {
        status: 'under_review',
        title: 'Electrical Feeder Checked',
        date: 'Oct 06, 2026 • 02:00 PM',
        author: 'R. K. Sharma',
        role: 'Electrical Section Officer',
        note: 'Underground timer relay fault identified at Feeder Pillar #7.'
      },
      {
        status: 'accepted',
        title: 'Work Order #WO-STL-892 Issued',
        date: 'Oct 07, 2026 • 11:15 AM',
        author: 'R. K. Sharma',
        role: 'Electrical Wing',
        note: 'Replacement LED driver units and relay requisitioned for night maintenance.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1004',
    isDemo: true,
    title: 'Underground drinking water distribution pipeline leak on Paud Road',
    description: 'Clean potable water is gushing from an underground utility line fissure, flooding roadside parking and causing low pressure in adjacent residential societies.',
    category: 'water_drainage',
    status: 'in_progress',
    address: 'Near Gandhi Bhavan Chowk, Paud Road, Kothrud, Pune, Maharashtra',
    latitude: 18.5074,
    longitude: 73.8077,
    reportedBy: {
      name: 'Meera Kulkarni',
      badge: 'Active Resident · Pune',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: 'Yesterday • 06:45 AM',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    upvotes: 18,
    hasUpvoted: true,
    mergedCount: 1,
    timeline: [
      {
        status: 'reported',
        title: 'Pipeline Breach Reported',
        date: 'Oct 09, 2026 • 06:45 AM',
        author: 'Meera Kulkarni',
        role: 'Citizen Reporter',
        note: 'High pressure drinking water line burst under pedestrian footpath.'
      },
      {
        status: 'in_progress',
        title: 'Isolation Valve Closed & Excavation Underway',
        date: 'Oct 09, 2026 • 10:30 AM',
        author: 'Suresh Deshmukh',
        role: 'Water Works Maintenance',
        note: 'Valve cluster isolated. Mechanical collar clamp fitting underway.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1005',
    isDemo: true,
    title: 'Monsoon drain silting causing waterlogging at Connaught Outer Circle',
    description: 'Subsurface storm drain inlet is choked with dry leaves and plastic debris. Moderate rainfall creates a 30cm waterlogged pond obstructing lane 1.',
    category: 'water_drainage',
    status: 'in_progress',
    address: 'Outer Circle, Near Block G, Connaught Place, New Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    reportedBy: {
      name: 'Aarav Sharma',
      badge: 'Civic Volunteer · New Delhi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    upvotes: 19,
    hasUpvoted: false,
    mergedCount: 1,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered',
        date: 'Oct 07, 2026 • 04:30 PM',
        author: 'Aarav Sharma',
        role: 'Citizen Reporter',
        note: 'Severe waterlogging at Block G approach flagged.'
      },
      {
        status: 'in_progress',
        title: 'Suction Dredging Machine Active',
        date: 'Oct 08, 2026 • 09:30 AM',
        author: 'Deepak Gupta',
        role: 'Drainage Department',
        note: 'High-pressure vacuum desilting vehicle deployed to clear culvert line.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1006',
    isDemo: true,
    title: 'Damaged crosswalk push-button signal and faded zebra crossing',
    description: 'The pedestrian signal activator on MG Road has a shattered button casing with exposed wires. Faded zebra crossing paint leaves commuters vulnerable to speeding buses.',
    category: 'traffic_safety',
    status: 'under_review',
    address: 'MG Road Junction, Near Metro Pillar 682, Ernakulam, Kochi, Kerala',
    latitude: 9.9723,
    longitude: 76.2785,
    reportedBy: {
      name: 'Anjali Menon',
      badge: 'Pedestrian Advocate · Kochi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '4 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    upvotes: 15,
    hasUpvoted: false,
    mergedCount: 0,
    timeline: [
      {
        status: 'reported',
        title: 'Pedestrian Signal Damage Logged',
        date: 'Today • 08:15 AM',
        author: 'Anjali Menon',
        role: 'Citizen Reporter',
        note: 'Pedestrian crossing activator damaged and crossing markers faded.'
      },
      {
        status: 'under_review',
        title: 'Traffic Engineering Review',
        date: 'Today • 11:00 AM',
        author: 'K. Rajan',
        role: 'Traffic Engineering Cell',
        note: 'Site inspection completed. Forwarded for signal hardware replacement.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1007',
    isDemo: true,
    title: 'Broken pedestrian footpath paver blocks along promenade',
    description: 'Cracked interlocking tiles and dislodged curb stones along market promenade caused tripping hazards for morning walkers and elderly residents.',
    category: 'public_infrastructure',
    status: 'citizen_verified',
    address: 'Market Footpath Promenade, Sayajigunj, Vadodara, Gujarat',
    latitude: 22.3108,
    longitude: 73.1874,
    reportedBy: {
      name: 'Sunita Verma',
      badge: 'Resident · Vadodara',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '4 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    completionEvidenceUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    upvotes: 42,
    hasUpvoted: true,
    mergedCount: 0,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered',
        date: 'Oct 04, 2026 • 08:30 AM',
        author: 'Sunita Verma',
        role: 'Citizen Reporter',
        note: 'Broken paver tiles flagged along Sayajigunj promenade.'
      },
      {
        status: 'completed',
        title: 'Footpath Re-tiled & Compacted',
        date: 'Oct 06, 2026 • 04:00 PM',
        author: 'Amit Patel',
        role: 'Roads & Infrastructure',
        note: 'Heavy-duty interlocking blocks relaid with reinforced border concrete.',
        evidenceImage: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'
      },
      {
        status: 'citizen_verified',
        title: 'Citizen Certified Resolution',
        date: 'Oct 07, 2026 • 10:15 AM',
        author: 'Sunita Verma',
        role: 'Community Verifier',
        note: 'Inspected pavement in person. Interlocking walkway is smooth and fully restored.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1008',
    isDemo: true,
    title: 'Large storm-fallen tree branch blocking pathway in public park',
    description: 'Heavy weekend rain brought down a major banyan limb across the walking track near Gate 4. The path is fully blocked for morning walkers and children.',
    category: 'public_infrastructure',
    status: 'in_progress',
    address: 'Near Gate 4 Jogging Track, Cubbon Park, Bengaluru, Karnataka',
    latitude: 12.9757,
    longitude: 77.5929,
    reportedBy: {
      name: 'Karthik Raman',
      badge: 'Green City Volunteer · Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: 'Yesterday • 07:10 AM',
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80',
    upvotes: 28,
    hasUpvoted: false,
    mergedCount: 1,
    timeline: [
      {
        status: 'reported',
        title: 'Fallen Tree Reported',
        date: 'Oct 09, 2026 • 07:10 AM',
        author: 'Karthik Raman',
        role: 'Citizen Reporter',
        note: 'Fallen banyan tree limb across central pathway.'
      },
      {
        status: 'in_progress',
        title: 'Horticulture Chainsaw Crew Deployed',
        date: 'Oct 09, 2026 • 02:30 PM',
        author: 'B. M. Siddaramaiah',
        role: 'Horticulture & Forestry Wing',
        note: 'Crews sectioning trunk for removal. Pathway expected clear by evening.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1009',
    isDemo: true,
    title: 'Unsanitary public toilet with choked water connection and broken latches',
    description: 'Community sanitation facility has no running water for flushing, resulting in extreme unhygienic conditions. Doors lack locking bolts, making it unusable for women commuters.',
    category: 'public_infrastructure',
    status: 'reported',
    address: 'Near Inter-State Bus Terminus, Sector 17, Chandigarh',
    latitude: 30.7398,
    longitude: 76.7827,
    reportedBy: {
      name: 'Gurpreet Singh',
      badge: 'Resident · Chandigarh',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '5 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    upvotes: 36,
    hasUpvoted: true,
    mergedCount: 0,
    timeline: [
      {
        status: 'reported',
        title: 'Public Sanitation Failure Reported',
        date: 'Today • 10:45 AM',
        author: 'Gurpreet Singh',
        role: 'Citizen Reporter',
        note: 'Public facility water supply choked and door hardware non-functional.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1010',
    isDemo: true,
    title: 'Missing blind-spot convex mirror and twisted speed limit signage',
    description: 'Sharp hair-pin turn has lost its convex mirror due to tree limb impact, and the 20 km/h advisory sign is bent flat against the pillar, leading to blind collisions.',
    category: 'traffic_safety',
    status: 'accepted',
    address: 'Curve Opposite Sagar Society, Road No. 12, Banjara Hills, Hyderabad, Telangana',
    latitude: 17.4156,
    longitude: 78.4357,
    reportedBy: {
      name: 'Fatima Begum',
      badge: 'Community Watch · Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
    upvotes: 21,
    hasUpvoted: false,
    mergedCount: 1,
    timeline: [
      {
        status: 'reported',
        title: 'Blind Spot Road Hazard Reported',
        date: 'Oct 07, 2026 • 11:20 AM',
        author: 'Fatima Begum',
        role: 'Citizen Reporter',
        note: 'Blind curve collision risk on Road No. 12.'
      },
      {
        status: 'accepted',
        title: 'Procurement of Heavy-duty Mirror Approved',
        date: 'Oct 08, 2026 • 03:15 PM',
        author: 'N. Prasad',
        role: 'Traffic Mobility Cell',
        note: 'Requisition order placed for 80cm stainless steel convex mirror and replacement post.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1011',
    isDemo: true,
    title: 'Stray plastic waste dumped in vacant municipal drainage buffer plot',
    description: 'Illegal midnight dumping of plastic packaging and construction debris in open plot adjacent to stormwater canal. Grazing animals ingest plastic sacks.',
    category: 'garbage_sanitation',
    status: 'reported',
    address: 'Near 2nd Avenue Canal Bridge, Anna Nagar West, Chennai, Tamil Nadu',
    latitude: 13.0850,
    longitude: 80.2101,
    reportedBy: {
      name: 'Murugan Swaminathan',
      badge: 'Civic Steward · Chennai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: 'Yesterday • 05:40 PM',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
    upvotes: 17,
    hasUpvoted: false,
    mergedCount: 0,
    timeline: [
      {
        status: 'reported',
        title: 'Illegal Plastic Dumping Reported',
        date: 'Oct 09, 2026 • 05:40 PM',
        author: 'Murugan Swaminathan',
        role: 'Citizen Reporter',
        note: 'Dumped waste along canal bank flagged for sanitation enforcement.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1012',
    isDemo: true,
    title: 'Unpaved telecom trench causing vehicular skidding on Tonk Road',
    description: 'A 50-meter long utility excavation across Tonk Road was backfilled with loose gravel but left un-asphalted. Two-wheelers frequently lose traction while braking.',
    category: 'roads_potholes',
    status: 'in_progress',
    address: 'Opposite Nehru Garden, Tonk Road, Jaipur, Rajasthan',
    latitude: 26.8924,
    longitude: 75.8052,
    reportedBy: {
      name: 'Rajendra Shekhawat',
      badge: 'Resident · Jaipur',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    upvotes: 25,
    hasUpvoted: true,
    mergedCount: 1,
    timeline: [
      {
        status: 'reported',
        title: 'Road Trench Hazard Flagged',
        date: 'Oct 08, 2026 • 01:10 PM',
        author: 'Rajendra Shekhawat',
        role: 'Citizen Reporter',
        note: 'Unpaved utility ditch causing traffic bottlenecks and bike skids.'
      },
      {
        status: 'in_progress',
        title: 'Road Restoration Notice Served & Crew Mobilized',
        date: 'Oct 09, 2026 • 11:00 AM',
        author: 'Mahesh Sharma',
        role: 'Public Works Division',
        note: 'Bituminous hot mix laying squad scheduled to seal excavation overnight.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1013',
    isDemo: true,
    title: 'Dangling low-hanging electrical power wires near bus stand',
    description: 'High-voltage distribution cables sagged to within 7 feet of the ground after a small storm. Pedestrians waiting at the bus stand risk accidental contact.',
    category: 'streetlights_power',
    status: 'reopened',
    address: 'Central Park Gate 3, Sector V, Salt Lake, Kolkata, West Bengal',
    latitude: 22.5804,
    longitude: 88.4286,
    reportedBy: {
      name: 'Ananya Sen',
      badge: 'Community Verifier · Kolkata',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '3 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
    upvotes: 39,
    hasUpvoted: false,
    mergedCount: 0,
    timeline: [
      {
        status: 'reported',
        title: 'Electrical Hazard Logged',
        date: 'Oct 05, 2026 • 03:00 PM',
        author: 'Ananya Sen',
        role: 'Citizen Reporter',
        note: 'Exposed wiring and sagging cable bundle outside park gate.'
      },
      {
        status: 'completed',
        title: 'Cable Tied Temporarily',
        date: 'Oct 06, 2026 • 05:00 PM',
        author: 'Subhash Roy',
        role: 'Street Lighting & Distribution Wing',
        note: 'Cable bundled with plastic zip ties.'
      },
      {
        status: 'reopened',
        title: 'Reopened by Citizen Inspection',
        date: 'Oct 07, 2026 • 09:20 AM',
        author: 'Ananya Sen',
        role: 'Citizen Verifier',
        note: 'Zip ties snapped in high wind. Permanent steel tension wire and higher mast clamp required for public safety.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1014',
    isDemo: true,
    title: 'Severe tap water turbidity and discoloration in residential sector',
    description: 'Tap water supplied by municipal reservoir is brown and muddy with strong odor for 4 consecutive mornings. Families forced to purchase commercial drinking water cans.',
    category: 'water_drainage',
    status: 'under_review',
    address: 'Sector 4, Gomti Nagar Extension, Lucknow, Uttar Pradesh',
    latitude: 26.8524,
    longitude: 80.9982,
    reportedBy: {
      name: 'Vikas Srivastava',
      badge: 'Resident · Lucknow',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: 'Yesterday • 07:30 AM',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    upvotes: 33,
    hasUpvoted: true,
    mergedCount: 2,
    timeline: [
      {
        status: 'reported',
        title: 'Water Quality Incident Logged',
        date: 'Oct 09, 2026 • 07:30 AM',
        author: 'Vikas Srivastava',
        role: 'Citizen Reporter',
        note: 'Turbid, brownish municipal tap water reported across Sector 4 blocks.'
      },
      {
        status: 'under_review',
        title: 'Jal Sansthan Water Testing Team Assigned',
        date: 'Oct 09, 2026 • 12:45 PM',
        author: 'Alok Mishra',
        role: 'Jal Sansthan Quality Lab',
        note: 'Samples collected from 3 distribution points to trace pipeline ingress.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1015',
    isDemo: true,
    title: 'Dislodged concrete road median at major four-way junction',
    description: 'A heavy vehicle collision shifted three concrete divider barriers into the right-turn lane, exposing metal reinforcement bars to fast-moving traffic.',
    category: 'traffic_safety',
    status: 'reported',
    address: 'Navrangpura Cross Road Junction, Ahmedabad, Gujarat',
    latitude: 23.0365,
    longitude: 72.5611,
    reportedBy: {
      name: 'Kabir Singh',
      badge: 'Civic Steward · Ahmedabad',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '6 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=800&auto=format&fit=crop&q=80',
    upvotes: 11,
    hasUpvoted: false,
    mergedCount: 0,
    timeline: [
      {
        status: 'reported',
        title: 'Complaint Registered',
        date: 'Today • 09:15 AM',
        author: 'Kabir Singh',
        role: 'Citizen Reporter',
        note: 'Dislodged median barrier posing acute vehicle collision danger.'
      }
    ]
  },
  {
    id: 'CV-DEMO-1016',
    isDemo: true,
    title: 'Broken wheelchair ramp at primary civic healthcare center',
    description: 'The concrete access ramp at the entrance has collapsed at the base curb. Wheelchair users, patients with walkers, and expectant mothers cannot enter safely.',
    category: 'public_infrastructure',
    status: 'in_progress',
    address: 'Urban Primary Health Centre, Shivaji Nagar, Pune, Maharashtra',
    latitude: 18.5314,
    longitude: 73.8446,
    reportedBy: {
      name: 'Dr. Sneha Joshi',
      badge: 'Healthcare Worker · Pune',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    upvotes: 45,
    hasUpvoted: true,
    mergedCount: 0,
    timeline: [
      {
        status: 'reported',
        title: 'Accessibility Failure Flagged',
        date: 'Oct 07, 2026 • 10:00 AM',
        author: 'Dr. Sneha Joshi',
        role: 'Citizen Reporter',
        note: 'Damaged wheelchair entry ramp preventing disabled citizen access to health clinic.'
      },
      {
        status: 'in_progress',
        title: 'Reinforced Concrete Re-concreting Initiated',
        date: 'Oct 08, 2026 • 08:30 AM',
        author: 'Suresh Deshmukh',
        role: 'Civil Infrastructure Works',
        note: 'Old broken lip chipped away. Steel rebar installed with anti-skid gradient.'
      }
    ]
  }
];
