export const CATEGORIES = [
  { id: 'all', label: 'All Issues', icon: 'Layers' },
  { id: 'roads_potholes', label: 'Roads & Potholes', icon: 'Car', color: 'amber' },
  { id: 'garbage_sanitation', label: 'Garbage & Waste', icon: 'Trash2', color: 'rose' },
  { id: 'streetlights_power', label: 'Streetlights & Power', icon: 'Lightbulb', color: 'yellow' },
  { id: 'water_drainage', label: 'Water & Drainage', icon: 'Droplets', color: 'blue' },
  { id: 'public_infrastructure', label: 'Public Parks & Infra', icon: 'Building2', color: 'emerald' },
  { id: 'traffic_safety', label: 'Traffic & Signage', icon: 'ShieldAlert', color: 'indigo' },
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
    label: 'In Progress',
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
    label: 'Reopened',
    bg: 'bg-rose-100 dark:bg-rose-950/70',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
    dot: 'bg-rose-500 animate-ping',
    step: 4
  }
};

export const INITIAL_ISSUES = [
  {
    id: 'CV-2026-9481',
    title: 'Deep Hazardous Pothole at Main St & 4th Avenue Intersection',
    description: 'A 2-foot wide pothole opened right after the weekend downpour. Multiple cyclists and cars have suffered blown tires. Rainwater obscures the true depth during evening commute.',
    category: 'roads_potholes',
    status: 'completed',
    address: '402 Main St, Ward 3, Central District',
    latitude: 37.7749,
    longitude: -122.4194,
    reportedBy: {
      name: 'Maya Lin',
      badge: 'Civic Steward (Level 3)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '3 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    completionEvidenceUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    upvotes: 84,
    hasUpvoted: false,
    timeline: [
      {
        status: 'reported',
        title: 'Dispatch Created by Citizen',
        date: 'Oct 02, 2026 • 08:15 AM',
        author: 'Maya Lin',
        role: 'Citizen Reporter',
        note: 'Report submitted with GPS coordinates and pavement image.'
      },
      {
        status: 'under_review',
        title: 'Triaged by Central Ward Desk',
        date: 'Oct 02, 2026 • 10:40 AM',
        author: 'Officer T. Henderson',
        role: 'Municipal Dispatcher',
        note: 'Verified address against GIS database. Severity flagged as High (cyclist hazard).'
      },
      {
        status: 'accepted',
        title: 'Accepted by Department of Transportation',
        date: 'Oct 02, 2026 • 02:10 PM',
        author: 'Dept of Public Works',
        role: 'Operations Desk',
        note: 'Work order #ROADS-8812 assigned to Road Asphalt Squad B.'
      },
      {
        status: 'in_progress',
        title: 'Asphalt Repair Crew Dispatched',
        date: 'Oct 03, 2026 • 09:30 AM',
        author: 'Crew Supervisor Carlos M.',
        role: 'Field Team',
        note: 'Heavy roller and hot-mix asphalt team onsite. Lane temporarily diverted.'
      },
      {
        status: 'completed',
        title: 'Repairs Completed & Sealant Applied',
        date: 'Oct 04, 2026 • 04:45 PM',
        author: 'Inspector Sarah Vance',
        role: 'Municipal QA Engineer',
        note: 'Surface leveled to grade, hot asphalt compacted, safety cones removed. Awaiting community verification.',
        evidenceImage: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'
      }
    ],
    verifications: [
      {
        userName: 'David K.',
        isResolved: true,
        comment: 'Drove through this morning, completely smooth! Thank you for the quick turnaround.',
        date: 'Yesterday'
      }
    ]
  },
  {
    id: 'CV-2026-9482',
    title: 'Severe Storm Drain Blockage & Street Overflow',
    description: 'Storm grate on Elm St is packed tight with autumn leaves, plastic wrappers, and soil. Even mild drizzle creates a 4-inch deep standing pond that floods the pedestrian crosswalk.',
    category: 'water_drainage',
    status: 'in_progress',
    address: '89 Elm Street near Oak Park, Ward 5',
    latitude: 37.7795,
    longitude: -122.4112,
    reportedBy: {
      name: 'Julian Thorne',
      badge: 'Neighborhood Watch',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    upvotes: 56,
    hasUpvoted: true,
    timeline: [
      {
        status: 'reported',
        title: 'Dispatch Logged',
        date: 'Oct 03, 2026 • 06:20 PM',
        author: 'Julian Thorne',
        role: 'Citizen Reporter',
        note: 'Grate flooded up to sidewalk level.'
      },
      {
        status: 'accepted',
        title: 'Municipal Drain Squad Assigned',
        date: 'Oct 04, 2026 • 08:00 AM',
        author: 'Sanitation Dept',
        role: 'Desk',
        note: 'Vacuum truck Hydro-4 assigned to clear blockage.'
      },
      {
        status: 'in_progress',
        title: 'Hydro-Clearing Ongoing',
        date: 'Today • 08:30 AM',
        author: 'Sanitation Squad',
        role: 'Field Crew',
        note: 'High pressure water jetting underway to remove sediment trap.'
      }
    ]
  },
  {
    id: 'CV-2026-9483',
    title: 'Three Continuous Broken Streetlights Causing Blackout Zone',
    description: 'Streetlamps #42, #43, and #44 on South Boulevard have been completely dark for over a week. The entire stretch behind the community library is pitch black at night, raising safety concerns.',
    category: 'streetlights_power',
    status: 'under_review',
    address: '1420 South Boulevard, Ward 2',
    latitude: 37.7690,
    longitude: -122.4280,
    reportedBy: {
      name: 'Amina El-Baz',
      badge: 'Local Resident',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    upvotes: 112,
    hasUpvoted: false,
    timeline: [
      {
        status: 'reported',
        title: 'Report Submitted',
        date: 'Oct 03, 2026 • 09:12 PM',
        author: 'Amina El-Baz',
        role: 'Citizen Reporter',
        note: 'Logged with night photo and pole numbers.'
      },
      {
        status: 'under_review',
        title: 'Grid Diagnostics Initiated',
        date: 'Oct 04, 2026 • 11:15 AM',
        author: 'Electrical Bureau',
        role: 'Grid Technician',
        note: 'Checking circuit feeder line breaker status for Sector 2B.'
      }
    ]
  },
  {
    id: 'CV-2026-9484',
    title: 'Overflowing Municipal Dumpster and Illegal Waste Dumping',
    description: 'The green public recycling dumpsters behind Market Square have breached capacity for 5 days. Cardboard pallets and household waste are spilling across the pedestrian alleyway attracting pests.',
    category: 'garbage_sanitation',
    status: 'reopened',
    address: 'Market Square Alleyway, Ward 1',
    latitude: 37.7830,
    longitude: -122.4080,
    reportedBy: {
      name: 'Kenji Sato',
      badge: 'Merchant Association',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '5 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    upvotes: 43,
    hasUpvoted: false,
    timeline: [
      {
        status: 'reported',
        title: 'Reported',
        date: 'Sep 30, 2026',
        author: 'Kenji Sato',
        role: 'Citizen Reporter',
        note: 'Bins overflowing into walkway.'
      },
      {
        status: 'completed',
        title: 'Marked Completed by Sanitation',
        date: 'Oct 02, 2026',
        author: 'Night Sanitation Truck #9',
        role: 'Contractor',
        note: 'Dumpster emptied on routine pickup.'
      },
      {
        status: 'reopened',
        title: 'Reopened by Citizen Verification',
        date: 'Oct 03, 2026',
        author: 'Kenji Sato',
        role: 'Citizen Reporter',
        note: 'Bins were emptied, but all loose trash and pallets scattered around the bins were left on the ground! Reopening ticket.'
      }
    ]
  },
  {
    id: 'CV-2026-9485',
    title: 'Damaged Playground Swing Support Beam in Heritage Park',
    description: 'Heavy rust corrosion on the left anchor clamp of the children swing set. The upper support crossbar wobbles noticeably when two swings are in use. Potential structural failure hazard.',
    category: 'public_infrastructure',
    status: 'citizen_verified',
    address: 'Heritage Park Playground, Ward 4',
    latitude: 37.7650,
    longitude: -122.4150,
    reportedBy: {
      name: 'Priya Sharma',
      badge: 'Parent Council',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '1 week ago',
    imageUrl: 'https://images.unsplash.com/photo-1588718904583-626a51445657?w=800&auto=format&fit=crop&q=80',
    completionEvidenceUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
    upvotes: 129,
    hasUpvoted: true,
    timeline: [
      {
        status: 'reported',
        title: 'Report Logged',
        date: 'Sep 27, 2026',
        author: 'Priya Sharma',
        role: 'Citizen Reporter',
        note: 'Flagged unsafe playground swing clamp.'
      },
      {
        status: 'accepted',
        title: 'Parks Inspection Safety Triage',
        date: 'Sep 28, 2026',
        author: 'Parks & Recreation Dept',
        role: 'Safety Officer',
        note: 'Caution tape applied immediately.'
      },
      {
        status: 'completed',
        title: 'New Galvanized Clamp Installed & Certified',
        date: 'Sep 30, 2026',
        author: 'Municipal Steelworks',
        role: 'Certified Contractor',
        note: 'Replaced rust-compromised mounting brackets with stainless steel hardware.'
      },
      {
        status: 'citizen_verified',
        title: 'Citizen Community Verified & Approved',
        date: 'Oct 01, 2026',
        author: 'Priya Sharma',
        role: 'Reporting Citizen',
        note: 'Checked during weekend visit. Swings are rock-solid and safe for children now!'
      }
    ]
  },
  {
    id: 'CV-2026-9486',
    title: 'Bent School Zone Crosswalk Sign Obscured by Overgrowth',
    description: 'Delivery truck backed into the fluorescent yellow 15 MPH School Speed Warning post, bending it at a 45-degree angle. Tree branches also cover the flashing beacon.',
    category: 'traffic_safety',
    status: 'reported',
    address: 'Lincoln Elementary Access Road, Ward 3',
    latitude: 37.7710,
    longitude: -122.4220,
    reportedBy: {
      name: 'Thomas Wright',
      badge: 'School Crossing Guard',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
    },
    reportedAt: '3 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    upvotes: 38,
    hasUpvoted: false,
    timeline: [
      {
        status: 'reported',
        title: 'Dispatch Created',
        date: 'Today • 02:40 AM',
        author: 'Thomas Wright',
        role: 'Citizen Reporter',
        note: 'Urgent sign repair requested before Monday morning student drop-off.'
      }
    ]
  }
];
