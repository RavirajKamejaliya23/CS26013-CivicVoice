-- ============================================================================
-- CivicVoice PostgreSQL Seed Data (Authoritative 11-Table Architecture)
-- India-First Localization (Vadodara Municipal Corporation & Gujarat Focus)
-- Compatible with Windows CMD / PowerShell / psql / pg-mem
--
-- Canonical Test Accounts (Passwords hashed with bcrypt, cost factor 10):
-- 1. Citizen:   citizen@civicvoice.org   / Citizen@123   (CITIZEN) -> Rohan Patel
-- 2. Municipal: municipal@civicvoice.org / Municipal@123 (MUNICIPAL) -> Amit Patel
-- 3. Admin:     admin@civicvoice.org     / Admin@123     (ADMIN) -> Kavita Mehta
-- ============================================================================

-- Clean existing data and reset identity sequences in reverse foreign-key order
TRUNCATE citizen_verifications, issue_reports, issue_assignments, issue_updates, issue_supports, issue_media, issues, locations, users, departments, categories RESTART IDENTITY CASCADE;

-- 1. DEPARTMENTS (Realistic Indian Civic Departments)
INSERT INTO departments (id, name, code, description) VALUES
(1, 'Roads & Infrastructure', 'RDS', 'Road surfacing, asphalt resurfacing, footpaths, bridges, and municipal civil infrastructure.'),
(2, 'Solid Waste Management', 'SWM', 'Municipal solid waste collection, door-to-door waste segregation, and sanitary landfill operations.'),
(3, 'Street Lighting', 'STL', 'LED street lamp luminaires, high-mast illumination, electrical feeder pillars, and timer triage.'),
(4, 'Storm Water Drainage', 'DRN', 'Storm water sewer cleaning, monsoon drain desilting, and urban flood mitigation.'),
(5, 'Water Supply', 'WTR', 'Potable drinking water distribution, pipeline maintenance, booster stations, and pressure regulation.'),
(6, 'Public Parks & Gardens', 'PRK', 'Municipal public gardens, tree pruning, park benches, and civic green spaces.'),
(7, 'Traffic & Road Safety', 'TRF', 'Traffic signals, road dividers, pedestrian zebra crossings, and directional signage.');

SELECT setval(pg_get_serial_sequence('departments', 'id'), 7);

-- 2. CATEGORIES
INSERT INTO categories (id, name, icon, color, description) VALUES
('roads_potholes', 'Roads & Potholes', 'Car', 'amber', 'Potholes, asphalt damage, broken curbs, and dangerous pavement fissures.'),
('garbage_sanitation', 'Solid Waste & Sanitation', 'Trash2', 'rose', 'Overflowing municipal waste bins, uncollected waste, and scattered street debris.'),
('streetlights_power', 'Street Lighting & Power', 'Lightbulb', 'yellow', 'Non-functional streetlights, exposed junction wiring, and dark corridors.'),
('water_drainage', 'Water Supply & Drainage', 'Droplets', 'blue', 'Blocked storm water drains, monsoon waterlogging, and water pipeline leaks.'),
('public_infrastructure', 'Parks & Public Infra', 'Building2', 'emerald', 'Damaged park equipment, broken footpaths, and public garden fixtures.'),
('traffic_safety', 'Traffic Safety & Signage', 'ShieldAlert', 'indigo', 'Damaged road dividers, malfunctioning traffic signals, and missing signs.');

-- 3. USERS (Canonical Roles: CITIZEN, MUNICIPAL, ADMIN with realistic Indian names)
INSERT INTO users (id, name, email, password_hash, role, badge, avatar, department_id, department) VALUES
(
    1,
    'Rohan Patel',
    'citizen@civicvoice.org',
    '$2a$10$fuVe6gMI4I1.gUOmg3Aeau1z3X7KGd7p18N1fSvQ3FQPYMN2rrgSa',
    'CITIZEN',
    'Active Citizen (Ward 6)',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    NULL,
    NULL
),
(
    2,
    'Amit Patel',
    'municipal@civicvoice.org',
    '$2a$10$MZbg1ZxPsIBJ4.OzxS0RWu5tptHpxL63528mvg51KmDsc3toKz27i',
    'MUNICIPAL',
    'Executive Engineer',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    1,
    'Roads & Infrastructure - Ward 6'
),
(
    3,
    'Kavita Mehta',
    'admin@civicvoice.org',
    '$2a$10$J52dMpTro.kiywNTdXlSyeZiuBvPGHzkQQM/tknWI3/zEDbjSujZm',
    'ADMIN',
    'Municipal Commissioner',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    NULL,
    'Vadodara Municipal Corporation'
),
(
    4,
    'Priya Shah',
    'priya.shah@gmail.com',
    '$2a$10$fuVe6gMI4I1.gUOmg3Aeau1z3X7KGd7p18N1fSvQ3FQPYMN2rrgSa',
    'CITIZEN',
    'Civic Steward (Gotri)',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    NULL,
    NULL
),
(
    5,
    'Mehul Desai',
    'mehul.desai@gmail.com',
    '$2a$10$fuVe6gMI4I1.gUOmg3Aeau1z3X7KGd7p18N1fSvQ3FQPYMN2rrgSa',
    'CITIZEN',
    'Resident (Manjalpur)',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    NULL,
    NULL
),
(
    6,
    'Neha Joshi',
    'neha.joshi@gmail.com',
    '$2a$10$fuVe6gMI4I1.gUOmg3Aeau1z3X7KGd7p18N1fSvQ3FQPYMN2rrgSa',
    'CITIZEN',
    'Active Resident (Karelibaug)',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    NULL,
    NULL
),
(
    7,
    'Rahul Mehta',
    'rahul.mehta@gmail.com',
    '$2a$10$fuVe6gMI4I1.gUOmg3Aeau1z3X7KGd7p18N1fSvQ3FQPYMN2rrgSa',
    'CITIZEN',
    'Resident (Alkapuri)',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    NULL,
    NULL
),
(
    8,
    'Aisha Khan',
    'aisha.khan@gmail.com',
    '$2a$10$fuVe6gMI4I1.gUOmg3Aeau1z3X7KGd7p18N1fSvQ3FQPYMN2rrgSa',
    'CITIZEN',
    'Resident (Fatehgunj)',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    NULL,
    NULL
),
(
    9,
    'Kiran Shah',
    'kiran.shah@vmc.gov.in',
    '$2a$10$MZbg1ZxPsIBJ4.OzxS0RWu5tptHpxL63528mvg51KmDsc3toKz27i',
    'MUNICIPAL',
    'Sanitation Officer',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    2,
    'Solid Waste Management - Ward 9'
),
(
    10,
    'Harsh Desai',
    'harsh.desai@vmc.gov.in',
    '$2a$10$MZbg1ZxPsIBJ4.OzxS0RWu5tptHpxL63528mvg51KmDsc3toKz27i',
    'MUNICIPAL',
    'Drainage Inspector',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    4,
    'Storm Water Drainage - Ward 5'
),
(
    11,
    'Rajesh Patel',
    'rajesh.patel@vmc.gov.in',
    '$2a$10$J52dMpTro.kiywNTdXlSyeZiuBvPGHzkQQM/tknWI3/zEDbjSujZm',
    'ADMIN',
    'Deputy Municipal Commissioner',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
    NULL,
    'Administration Directorate'
);

SELECT setval(pg_get_serial_sequence('users', 'id'), 11);

-- 4. LOCATIONS (Realistic Vadodara and Gujarat Municipal Locations)
INSERT INTO locations (id, address, ward, district, city, pincode, latitude, longitude) VALUES
(1, 'Near Gotri Road Primary School, Gotri', 'Ward 6', 'West Zone', 'Vadodara', '390021', 22.3168, 73.1495),
(2, 'Gotri Road Bus Stop near Yash Complex', 'Ward 6', 'West Zone', 'Vadodara', '390021', 22.3175, 73.1490),
(3, 'Opposite Gotri Public Garden, Gotri', 'Ward 6', 'West Zone', 'Vadodara', '390021', 22.3182, 73.1485),
(4, 'Residential Lane near Darbar Chowk, Manjalpur', 'Ward 9', 'South Zone', 'Vadodara', '390011', 22.2682, 73.1953),
(5, 'Municipal Waste Bin area, Manjalpur Main Road', 'Ward 9', 'South Zone', 'Vadodara', '390011', 22.2688, 73.1948),
(6, 'Near Fatehgunj Bus Stop, Fatehgunj Main Bazaar', 'Ward 2', 'North Zone', 'Vadodara', '390002', 22.3224, 73.1865),
(7, 'Underpass approach road, RC Dutt Road, Alkapuri', 'Ward 5', 'West Zone', 'Vadodara', '390007', 22.3106, 73.1704),
(8, 'Sayajigunj Market Footpath, near Tower Circle', 'Ward 4', 'Central Zone', 'Vadodara', '390005', 22.3108, 73.1874),
(9, 'Near Shivalik Society, Waghodia Road', 'Ward 8', 'East Zone', 'Vadodara', '390019', 22.2952, 73.2268),
(10, 'Akota Main Junction Divider, Stadium Road', 'Ward 7', 'West Zone', 'Vadodara', '390020', 22.2965, 73.1672),
(11, 'Karelibaug Public Garden, Water Tank Road', 'Ward 3', 'North Zone', 'Vadodara', '390018', 22.3245, 73.1960),
(12, 'Vasna-Bhayli Canal Road, near residential colony', 'Ward 10', 'South-West Zone', 'Vadodara', '390012', 22.2854, 73.1362),
(13, 'Makarpura GIDC Main Crossroad, Makarpura', 'Ward 11', 'South Zone', 'Vadodara', '390010', 22.2530, 73.1967),
(14, 'Sayaji Baug Pedestrian Pathway, near Gate 2', 'Ward 4', 'Central Zone', 'Vadodara', '390005', 22.3135, 73.1890),
(15, 'RC Dutt Road & Jetalpur Traffic Junction, Alkapuri', 'Ward 5', 'West Zone', 'Vadodara', '390007', 22.3120, 73.1720),
(16, 'Karelibaug Circle, near electrical feeder pillar', 'Ward 3', 'North Zone', 'Vadodara', '390018', 22.3235, 73.1950),
(17, 'Ashram Road Service Lane, near Income Tax Circle', 'Ward 1', 'West Zone', 'Ahmedabad', '380009', 23.0338, 72.5714),
(18, 'Athwa Gate Junction Road section', 'Ward 2', 'South-West Zone', 'Surat', '395007', 21.1702, 72.8311);

SELECT setval(pg_get_serial_sequence('locations', 'id'), 18);

-- 5. ISSUES (Realistic Indian Civic Scenarios with Vadodara Canonical IDs CV-VAD-2026-XXXX)
INSERT INTO issues (
    id,
    title,
    description,
    category_id,
    status,
    location_id,
    address,
    latitude,
    longitude,
    image_url,
    completion_evidence_url,
    reported_by_id,
    reporter_name,
    reporter_badge,
    reporter_avatar,
    upvotes_count,
    duplicate_of
) VALUES
-- Canonical Issue 1 (Gotri Road Pothole)
(
    'CV-VAD-2026-1001',
    'Pothole near the school entrance on Gotri Road',
    'A 2-foot wide hazardous pothole has opened near the school entrance on Gotri Road after monsoon rains. School vans and two-wheelers are swerving dangerously.',
    'roads_potholes',
    'in_progress',
    1,
    'Near Gotri Road Primary School, Gotri, Ward 6',
    22.3168,
    73.1495,
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    NULL,
    1,
    'Rohan Patel',
    'Active Citizen (Ward 6)',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    14,
    NULL
),
-- Merged Duplicate of Issue 1
(
    'CV-VAD-2026-1002',
    'Deep crater and asphalt damage near Gotri Road bus stop',
    'Severe road damage and deep asphalt depression right in front of the Gotri Road bus stop causing traffic disruption.',
    'roads_potholes',
    'under_review',
    2,
    'Gotri Road Bus Stop near Yash Complex, Ward 6',
    22.3175,
    73.1490,
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    NULL,
    4,
    'Priya Shah',
    'Civic Steward (Gotri)',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    6,
    'CV-VAD-2026-1001'
),
-- Duplicate Candidate on Gotri Road (Active candidate for demo)
(
    'CV-VAD-2026-1003',
    'Hazardous road pothole opposite Gotri Garden',
    'Asphalt fissure and broken gravel surface creating hazard for scooters near Gotri Garden stretch.',
    'roads_potholes',
    'under_review',
    3,
    'Opposite Gotri Public Garden, Gotri, Ward 6',
    22.3182,
    73.1485,
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    NULL,
    7,
    'Rahul Mehta',
    'Resident (Alkapuri)',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    3,
    NULL
),
-- Canonical Issue 2 (Manjalpur Waste)
(
    'CV-VAD-2026-1004',
    'Garbage accumulation near the residential lane in Manjalpur',
    'Municipal solid waste has not been collected for three consecutive days. Stray cattle and dogs are scattering waste across the road.',
    'garbage_sanitation',
    'reported',
    4,
    'Residential Lane near Darbar Chowk, Manjalpur, Ward 9',
    22.2682,
    73.1953,
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    NULL,
    5,
    'Mehul Desai',
    'Resident (Manjalpur)',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    8,
    NULL
),
-- Merged Duplicate of Issue 2
(
    'CV-VAD-2026-1005',
    'Overflowing municipal waste bin near Manjalpur Darbar Chowk',
    'Community dustbin overflowing with plastic waste and food containers spreading unpleasant odor across residential society.',
    'garbage_sanitation',
    'under_review',
    5,
    'Municipal Waste Bin area, Manjalpur Main Road, Ward 9',
    22.2688,
    73.1948,
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    NULL,
    1,
    'Rohan Patel',
    'Active Citizen (Ward 6)',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    4,
    'CV-VAD-2026-1004'
),
-- Canonical Issue 3 (Fatehgunj Streetlight)
(
    'CV-VAD-2026-1006',
    'Streetlight not working near the bus stop in Fatehgunj',
    'Two overhead streetlamp fixtures failed outside the main Fatehgunj bus stop. Pedestrians and university students feel unsafe walking after dark.',
    'streetlights_power',
    'accepted',
    6,
    'Near Fatehgunj Bus Stop, Fatehgunj Main Bazaar, Ward 2',
    22.3224,
    73.1865,
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    NULL,
    8,
    'Aisha Khan',
    'Resident (Fatehgunj)',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    11,
    NULL
),
-- Canonical Issue 4 (Alkapuri Drainage)
(
    'CV-VAD-2026-1007',
    'Blocked drainage causing waterlogging after rainfall near Alkapuri underpass',
    'Underground storm water drain is heavily clogged with silt and plastic debris. Rainwater causes 1-foot waterlogging near the Alkapuri underpass entrance.',
    'water_drainage',
    'in_progress',
    7,
    'Underpass approach road, RC Dutt Road, Alkapuri, Ward 5',
    22.3106,
    73.1704,
    'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    NULL,
    7,
    'Rahul Mehta',
    'Resident (Alkapuri)',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    19,
    NULL
),
-- Canonical Issue 5 (Sayajigunj Footpath - Resolved & Verified)
(
    'CV-VAD-2026-1008',
    'Broken footpath tiles near Sayajigunj market area',
    'Damaged paver blocks and broken kerbstone tiles along the market promenade were causing tripping accidents among senior citizens.',
    'public_infrastructure',
    'citizen_verified',
    8,
    'Sayajigunj Market Footpath, near Tower Circle, Ward 4',
    22.3108,
    73.1874,
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    1,
    'Rohan Patel',
    'Active Citizen (Ward 6)',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    24,
    NULL
),
-- Canonical Issue 6 (Waghodia Road Pipeline)
(
    'CV-VAD-2026-1009',
    'Water pipeline leakage near the residential society on Waghodia Road',
    'Potable water pipeline has cracked underground, wasting clean municipal drinking water and creating a muddy slush corridor in the residential society entrance.',
    'water_drainage',
    'in_progress',
    9,
    'Near Shivalik Society, Waghodia Road, Ward 8',
    22.2952,
    73.2268,
    'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    NULL,
    1,
    'Rohan Patel',
    'Active Citizen (Ward 6)',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    15,
    NULL
),
-- Canonical Issue 7 (Akota Road Divider)
(
    'CV-VAD-2026-1010',
    'Damaged road divider near Akota main junction',
    'Concrete median blocks were dislodged by a vehicle collision, exposing rebar steel spikes at the busy intersection.',
    'traffic_safety',
    'reported',
    10,
    'Akota Main Junction Divider, Stadium Road, Ward 7',
    22.2965,
    73.1672,
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    NULL,
    4,
    'Priya Shah',
    'Civic Steward (Gotri)',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    7,
    NULL
),
-- Canonical Issue 8 (Karelibaug Waste Bin - Completed, Pending Verification)
(
    'CV-VAD-2026-1011',
    'Overflowing municipal waste bin near Karelibaug public garden',
    'Heavy waste accumulation outside the public garden gate. Municipal sanitation squad has cleared the site and placed an enlarged secondary bin.',
    'garbage_sanitation',
    'completed',
    11,
    'Karelibaug Public Garden, Water Tank Road, Ward 3',
    22.3245,
    73.1960,
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    6,
    'Neha Joshi',
    'Active Resident (Karelibaug)',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    12,
    NULL
),
-- Canonical Issue 9 (Vasna Low Water Pressure)
(
    'CV-VAD-2026-1012',
    'Low water pressure and muddy water supply in Vasna locality',
    'Residents in the canal belt have received discolored municipal tap water with negligible pressure for two days.',
    'water_drainage',
    'under_review',
    12,
    'Vasna-Bhayli Canal Road, near residential colony, Ward 10',
    22.2854,
    73.1362,
    'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    NULL,
    5,
    'Mehul Desai',
    'Resident (Manjalpur)',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    9,
    NULL
),
-- Canonical Issue 10 (Makarpura Open Manhole)
(
    'CV-VAD-2026-1013',
    'Open manhole cover posing danger on Makarpura Main Road',
    'Heavy cast iron sewer cover is missing near the GIDC crossroad. Poses life-threatening danger to cyclists and commuters at night.',
    'roads_potholes',
    'in_progress',
    13,
    'Makarpura GIDC Main Crossroad, Makarpura, Ward 11',
    22.2530,
    73.1967,
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    NULL,
    1,
    'Rohan Patel',
    'Active Citizen (Ward 6)',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    21,
    NULL
),
-- Canonical Issue 11 (Sayaji Baug Tree Obstruction)
(
    'CV-VAD-2026-1014',
    'Fallen tree branch obstructing pedestrian pathway at Sayaji Baug',
    'Large banyan tree branch cracked during high winds and is blocking the walking track near Gate 2.',
    'public_infrastructure',
    'reported',
    14,
    'Sayaji Baug Pedestrian Pathway, near Gate 2, Ward 4',
    22.3135,
    73.1890,
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    NULL,
    8,
    'Aisha Khan',
    'Resident (Fatehgunj)',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    5,
    NULL
),
-- Canonical Issue 12 (Alkapuri Traffic Signal Malfunction)
(
    'CV-VAD-2026-1015',
    'Traffic signal timer malfunction at RC Dutt Road junction',
    'Automated red light signal timing stuck on continuous yellow flasher causing heavy vehicle congestion at RC Dutt Road intersection.',
    'traffic_safety',
    'accepted',
    15,
    'RC Dutt Road & Jetalpur Traffic Junction, Alkapuri, Ward 5',
    22.3120,
    73.1720,
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    NULL,
    7,
    'Rahul Mehta',
    'Resident (Alkapuri)',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    8,
    NULL
),
-- Canonical Issue 13 (Karelibaug Exposed Wiring - Reopened)
(
    'CV-VAD-2026-1016',
    'Streetlight pole wiring exposed near Karelibaug circle',
    'Lower maintenance junction hatch cover is missing on street lighting pole with exposed 230V wiring at child height.',
    'streetlights_power',
    'reopened',
    16,
    'Karelibaug Circle, near electrical feeder pillar, Ward 3',
    22.3235,
    73.1950,
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    NULL,
    6,
    'Neha Joshi',
    'Active Resident (Karelibaug)',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    13,
    NULL
),
-- Regional Issue 14 (Ahmedabad)
(
    'CV-VAD-2026-1017',
    'Sewage overflow on service road near Ashram Road',
    'Underground drainage line backflow overflowing onto public walkway near commercial complex.',
    'water_drainage',
    'reported',
    17,
    'Ashram Road Service Lane, near Income Tax Circle, Ward 1',
    23.0338,
    72.5714,
    'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    NULL,
    4,
    'Priya Shah',
    'Civic Steward (Gotri)',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    6,
    NULL
),
-- Regional Issue 15 (Surat)
(
    'CV-VAD-2026-1018',
    'Potholes along Athwa Gate road section',
    'Multiple asphalt craters across both carriageway lanes leading to bridge entrance.',
    'roads_potholes',
    'under_review',
    18,
    'Athwa Gate Junction Road section, Ward 2',
    21.1702,
    72.8311,
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    NULL,
    5,
    'Mehul Desai',
    'Resident (Manjalpur)',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    10,
    NULL
);

-- 6. ISSUE MEDIA
INSERT INTO issue_media (issue_id, uploaded_by_id, media_url, media_type, caption) VALUES
('CV-VAD-2026-1001', 1, 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80', 'image', 'Initial pothole near Gotri school gate'),
('CV-VAD-2026-1004', 5, 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80', 'image', 'Uncollected solid waste pile in residential lane'),
('CV-VAD-2026-1006', 8, 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80', 'image', 'Darkened bus stop zone after dusk in Fatehgunj'),
('CV-VAD-2026-1007', 7, 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80', 'image', 'Storm water blockage causing 1ft pool at Alkapuri underpass'),
('CV-VAD-2026-1008', 1, 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80', 'image', 'New paver tiles aligned and grouted at Sayajigunj market'),
('CV-VAD-2026-1011', 6, 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80', 'image', 'Overflowing garbage bin before sanitation squad arrival'),
('CV-VAD-2026-1011', 2, 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80', 'image', 'Sanitation squad completed clearance and site wash');

-- 7. ISSUE UPDATES (Lifecycle Audit History)
INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note, evidence_image) VALUES
('CV-VAD-2026-1001', 'reported', 'Complaint Registered by Citizen', 1, 'Rohan Patel', 'Citizen Reporter', 'Pothole registered on Gotri Road with photograph and GPS location.', NULL),
('CV-VAD-2026-1001', 'under_review', 'Triage & Department Inspection Assigned', 2, 'Amit Patel', 'Executive Engineer', 'Inspected site on Gotri Road. Graded Priority 1 (School Zone Hazard). Assigned to Road Surface Squad.', NULL),
('CV-VAD-2026-1001', 'in_progress', 'Work in Progress - Road Squad Mobilized', 2, 'Amit Patel', 'Roads & Infrastructure', 'Hot-mix asphalt patch squad deployed. Safety cones and barricades placed.', NULL),
('CV-VAD-2026-1001', 'in_progress', 'Duplicate Complaint Merged', 3, 'Kavita Mehta', 'Municipal Administration', 'Complaint CV-VAD-2026-1002 from Priya Shah was merged into this canonical complaint. 6 additional supporters consolidated.', NULL),

('CV-VAD-2026-1002', 'reported', 'Complaint Registered by Citizen', 4, 'Priya Shah', 'Citizen Reporter', 'Reported severe crater near Gotri bus stop.', NULL),
('CV-VAD-2026-1002', 'under_review', 'Marked as Duplicate by Administrator', 3, 'Kavita Mehta', 'Admin Moderation', 'This issue has been identified as a duplicate of canonical complaint CV-VAD-2026-1001: "Pothole near the school entrance on Gotri Road". Supporters consolidated.', NULL),

('CV-VAD-2026-1004', 'reported', 'Complaint Registered by Citizen', 5, 'Mehul Desai', 'Citizen Reporter', 'Uncollected solid waste reported in Manjalpur residential lane.', NULL),
('CV-VAD-2026-1004', 'reported', 'Duplicate Complaint Merged', 3, 'Kavita Mehta', 'Municipal Administration', 'Complaint CV-VAD-2026-1005 from Rohan Patel consolidated here. 4 additional supporters added.', NULL),

('CV-VAD-2026-1005', 'reported', 'Complaint Registered by Citizen', 1, 'Rohan Patel', 'Citizen Reporter', 'Reported bin overflow near Darbar Chowk.', NULL),
('CV-VAD-2026-1005', 'under_review', 'Marked as Duplicate by Administrator', 3, 'Kavita Mehta', 'Admin Moderation', 'Consolidated into canonical complaint CV-VAD-2026-1004.', NULL),

('CV-VAD-2026-1006', 'reported', 'Complaint Registered by Citizen', 8, 'Aisha Khan', 'Citizen Reporter', 'Darkened bus stop lighting corridor reported.', NULL),
('CV-VAD-2026-1006', 'accepted', 'Work Order #WO-STL-412 Issued', 2, 'Amit Patel', 'Municipal Officer', 'Bucket truck and LED drivers scheduled for night shift replacement.', NULL),

('CV-VAD-2026-1007', 'reported', 'Complaint Registered by Citizen', 7, 'Rahul Mehta', 'Citizen Reporter', 'Underpass storm drain waterlogging reported.', NULL),
('CV-VAD-2026-1007', 'under_review', 'Drainage Squad Dispatched', 10, 'Harsh Desai', 'Drainage Inspector', 'Suction jetting machine dispatched to clear clogged culvert.', NULL),
('CV-VAD-2026-1007', 'in_progress', 'Culvert Jetting in Progress', 10, 'Harsh Desai', 'Storm Water Drainage', 'High-pressure water jetting active to clear plastic blockage.', NULL),

('CV-VAD-2026-1008', 'reported', 'Complaint Registered by Citizen', 1, 'Rohan Patel', 'Citizen Reporter', 'Broken footpath pavers causing tripping hazard.', NULL),
('CV-VAD-2026-1008', 'completed', 'Footpath Re-tiled & Compacted', 2, 'Amit Patel', 'Roads & Infrastructure', 'Paver blocks relaid with interlocking border and cement wash.', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'),
('CV-VAD-2026-1008', 'citizen_verified', 'Citizen Certified Resolution', 1, 'Rohan Patel', 'Community Verifier', 'Inspected footpath in person. Walkway is smooth and safe for pedestrians.', NULL),

('CV-VAD-2026-1011', 'reported', 'Complaint Registered by Citizen', 6, 'Neha Joshi', 'Citizen Reporter', 'Waste bin overflowing outside Karelibaug garden.', NULL),
('CV-VAD-2026-1011', 'in_progress', 'Sanitation Squad Dispatched', 9, 'Kiran Shah', 'Solid Waste Management', 'Compactor tipper vehicle en route for clearing.', NULL),
('CV-VAD-2026-1011', 'completed', 'Waste Cleared & Secondary Bin Installed', 9, 'Kiran Shah', 'Solid Waste Management', 'All waste lifted and area bleached. Additional 1.1 cubic metre bin placed.', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'),

('CV-VAD-2026-1016', 'reported', 'Complaint Registered by Citizen', 6, 'Neha Joshi', 'Citizen Reporter', 'Exposed junction box wiring on streetlight pole.', NULL),
('CV-VAD-2026-1016', 'completed', 'Cover Sealed', 2, 'Amit Patel', 'Street Lighting', 'Protective cover secured with screw latch.', NULL),
('CV-VAD-2026-1016', 'reopened', 'Reopened by Citizen Inspection', 6, 'Neha Joshi', 'Citizen Verifier', 'Cover screw came loose within 24 hours. Exposed wire still dangerously accessible to children.', NULL);

-- 8. ISSUE ASSIGNMENTS
INSERT INTO issue_assignments (issue_id, department_id, assigned_to_user_id, assigned_by_user_id, status, notes) VALUES
('CV-VAD-2026-1001', 1, 2, 3, 'in_progress', 'Assigned to Roads & Infrastructure Squad for emergency resurfacing.'),
('CV-VAD-2026-1004', 2, 9, 3, 'assigned', 'Assigned to SWM Ward 9 collection team.'),
('CV-VAD-2026-1006', 3, 2, 3, 'accepted', 'Assigned to Street Lighting repair crew.'),
('CV-VAD-2026-1007', 4, 10, 3, 'in_progress', 'Assigned to Drainage Jetting Unit.');

-- 9. ISSUE SUPPORTS (Enforced unique co-signing per user)
INSERT INTO issue_supports (user_id, issue_id) VALUES
(1, 'CV-VAD-2026-1001'),
(4, 'CV-VAD-2026-1001'),
(5, 'CV-VAD-2026-1001'),
(6, 'CV-VAD-2026-1001'),
(7, 'CV-VAD-2026-1001'),
(8, 'CV-VAD-2026-1001'),
(4, 'CV-VAD-2026-1002'),
(5, 'CV-VAD-2026-1004'),
(7, 'CV-VAD-2026-1004'),
(8, 'CV-VAD-2026-1006'),
(1, 'CV-VAD-2026-1007'),
(7, 'CV-VAD-2026-1007'),
(1, 'CV-VAD-2026-1008'),
(1, 'CV-VAD-2026-1009'),
(6, 'CV-VAD-2026-1011'),
(6, 'CV-VAD-2026-1016');

-- 10. CITIZEN VERIFICATIONS
INSERT INTO citizen_verifications (issue_id, user_id, user_name, is_resolved, comment) VALUES
('CV-VAD-2026-1008', 1, 'Rohan Patel', TRUE, 'Inspected the newly laid paver tiles at Sayajigunj market. Smooth finish and level walkway.'),
('CV-VAD-2026-1016', 6, 'Neha Joshi', FALSE, 'Junction hatch fell open again. Live copper wire exposed. Reopened for safety.');

-- 11. ISSUE REPORTS (Moderation Flags)
INSERT INTO issue_reports (issue_id, reported_by_id, reason, details, status) VALUES
('CV-VAD-2026-1003', 1, 'Duplicate Report', 'Same road pothole stretch on Gotri Road already logged under CV-VAD-2026-1001.', 'pending');
