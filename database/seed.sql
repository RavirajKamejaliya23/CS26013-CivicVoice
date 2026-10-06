-- ============================================================================
-- CivicVoice PostgreSQL Seed Data (Authoritative 11-Table Architecture)
-- Pure ASCII UTF-8 Encoded - Compatible with Windows CMD / PowerShell / psql
--
-- Development Test Accounts (Passwords hashed with bcrypt, cost factor 10):
-- 1. Citizen:   citizen@civicvoice.org   / Citizen@123   (CITIZEN)
-- 2. Municipal: municipal@civicvoice.org / Municipal@123 (MUNICIPAL)
-- 3. Admin:     admin@civicvoice.org     / Admin@123     (ADMIN)
-- ============================================================================

-- Clean existing data in reverse foreign-key order
DELETE FROM citizen_verifications;
DELETE FROM issue_reports;
DELETE FROM issue_assignments;
DELETE FROM issue_updates;
DELETE FROM issue_supports;
DELETE FROM issue_media;
DELETE FROM issues;
DELETE FROM locations;
DELETE FROM users;
DELETE FROM departments;
DELETE FROM categories;

-- 1. DEPARTMENTS
INSERT INTO departments (name, code, description) VALUES
('Dept of Public Works', 'DPW', 'Road surfacing, storm drains, street fixtures, and structural infrastructure repairs.'),
('Dept of Sanitation', 'DOS', 'Municipal waste management, dumpster clearance, and public recycling.'),
('Bureau of Street Lighting', 'BSL', 'Grid power, streetlamp luminaires, illumination repairs, and blackout triage.'),
('Parks and Recreation', 'DPR', 'Public green spaces, playgrounds, civic monuments, and recreational facilities.');

-- 2. CATEGORIES
INSERT INTO categories (id, name, icon, color, description) VALUES
('roads_potholes', 'Roads & Potholes', 'Car', 'amber', 'Potholes, asphalt sinking, broken curbs, and dangerous pavement fissures.'),
('garbage_sanitation', 'Garbage & Waste', 'Trash2', 'rose', 'Overflowing dumpsters, uncollected trash bags, and scattered street debris.'),
('streetlights_power', 'Streetlights & Power', 'Lightbulb', 'yellow', 'Burned-out street lamps, exposed electrical junction boxes, and blackout corridors.'),
('water_drainage', 'Water & Drainage', 'Droplets', 'blue', 'Blocked storm sewer grates, pooling rainwater, and broken water line mains.'),
('public_infrastructure', 'Public Parks & Infra', 'Building2', 'emerald', 'Damaged park equipment, severed playground fixtures, and cracked sidewalks.'),
('traffic_safety', 'Traffic & Signage', 'ShieldAlert', 'indigo', 'Obscured stop signs, dysfunctional traffic signals, and damaged guardrails.');

-- 3. USERS (Canonical Roles: CITIZEN, MUNICIPAL, ADMIN)
INSERT INTO users (name, email, password_hash, role, badge, avatar, department_id, department) VALUES
(
    'Maya Lin',
    'citizen@civicvoice.org',
    '$2a$10$fuVe6gMI4I1.gUOmg3Aeau1z3X7KGd7p18N1fSvQ3FQPYMN2rrgSa',
    'CITIZEN',
    'Civic Steward (Level 3)',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    NULL,
    NULL
),
(
    'Supervisor R. Vance',
    'municipal@civicvoice.org',
    '$2a$10$MZbg1ZxPsIBJ4.OzxS0RWu5tptHpxL63528mvg51KmDsc3toKz27i',
    'MUNICIPAL',
    'Municipal Officer',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    1,
    'Dept of Public Works - Field Squad'
),
(
    'Commissioner Elena Rostova',
    'admin@civicvoice.org',
    '$2a$10$J52dMpTro.kiywNTdXlSyeZiuBvPGHzkQQM/tknWI3/zEDbjSujZm',
    'ADMIN',
    'Chief Administrator',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    NULL,
    'Executive Municipal Oversight Board'
);

-- 4. LOCATIONS
INSERT INTO locations (address, ward, district, city, latitude, longitude) VALUES
('402 Main St, Ward 3, Central District', 'Ward 3', 'Central District', 'San Francisco', 37.7749, -122.4194),
('88 Park Boulevard, Ward 7, Westside', 'Ward 7', 'Westside', 'San Francisco', 37.7833, -122.4167),
('Crossway and Elm St, Ward 2, Midtown', 'Ward 2', 'Midtown', 'San Francisco', 37.7699, -122.4467),
('152 Riverside Terrace, Ward 5, Riverfront', 'Ward 5', 'Riverfront', 'San Francisco', 37.7589, -122.4144),
('Civic Memorial Park, Ward 4', 'Ward 4', 'Civic Park', 'San Francisco', 37.7912, -122.4089);

-- 5. ISSUES
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
    upvotes_count
) VALUES
(
    'CV-2026-9481',
    'Deep Hazardous Pothole at Main St & 4th Avenue Intersection',
    'A 2-foot wide pothole opened right after the weekend downpour. Multiple cyclists and cars have suffered blown tires. Rainwater obscures the true depth during evening commute.',
    'roads_potholes',
    'completed',
    1,
    '402 Main St, Ward 3, Central District',
    37.7749,
    -122.4194,
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    1,
    'Maya Lin',
    'Civic Steward (Level 3)',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    84
),
(
    'CV-2026-8812',
    'Commercial Dumpster Overflow & Windblown Debris at Park Plaza',
    'Bins have not been emptied for six days. Wind is blowing plastic food containers and glass bottles across the children playground pathway.',
    'garbage_sanitation',
    'in_progress',
    2,
    '88 Park Boulevard, Ward 7, Westside',
    37.7833,
    -122.4167,
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    NULL,
    1,
    'Marcus Thorne',
    'Neighborhood Watch',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    42
),
(
    'CV-2026-7320',
    'Twin High-Mast Streetlights Darkened Creating Blackout Corridor',
    'Two adjacent sodium lamps burned out simultaneously outside the subway entrance. Pedestrians feel unsafe navigating after dusk.',
    'streetlights_power',
    'accepted',
    3,
    'Crossway and Elm St, Ward 2, Midtown',
    37.7699,
    -122.4467,
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    NULL,
    1,
    'Aaliyah Patel',
    'Verified Citizen',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    67
),
(
    'CV-2026-6190',
    'Clogged Catch Basin Causing 6-Inch Street Flooding During Storms',
    'Leaves, construction gravel, and street trash have compacted in the storm grate. Water backs up into storefront doorways.',
    'water_drainage',
    'reported',
    4,
    '152 Riverside Terrace, Ward 5, Riverfront',
    37.7589,
    -122.4144,
    'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    NULL,
    1,
    'Kenji Sato',
    'Local Merchant',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    29
),
(
    'CV-2026-5541',
    'Playground Swing Set Anchor Bolt Severed & Hazardous Chains',
    'One of the heavy duty toddler swing chains snapped loose from the upper beam. Metal edges exposed to toddlers.',
    'public_infrastructure',
    'citizen_verified',
    5,
    'Civic Memorial Park, Ward 4',
    37.7912,
    -122.4089,
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    1,
    'Siddharth Verma',
    'Parent Association',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    115
);

-- 6. ISSUE MEDIA (Up to 10 photos per issue)
INSERT INTO issue_media (issue_id, uploaded_by_id, media_url, media_type, caption) VALUES
('CV-2026-9481', 1, 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80', 'image', 'Initial pothole opening after rainstorm'),
('CV-2026-9481', 2, 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80', 'image', 'Hot-mix asphalt patch compacted and sealed'),
('CV-2026-8812', 1, 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80', 'image', 'Overflowing park dumpster bins'),
('CV-2026-7320', 1, 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80', 'image', 'Subway exit blackout area'),
('CV-2026-6190', 1, 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80', 'image', 'Clogged sewer catchment basin'),
('CV-2026-5541', 1, 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80', 'image', 'Damaged swing beam hardware');

-- 7. ISSUE UPDATES (Lifecycle Audit History)
INSERT INTO issue_updates (issue_id, status, title, author_id, author, role, note, evidence_image) VALUES
('CV-2026-9481', 'reported', 'Citizen Dispatch Created', 1, 'Maya Lin', 'Citizen Reporter', 'Report submitted with GPS coordinates and pavement image.', NULL),
('CV-2026-9481', 'under_review', 'Triage & Department Routing', 2, 'Dispatcher J. Kowalski', 'Ward 3 Municipal Hub', 'Assessed priority Level 1 (Severe Cyclist Hazard). Dispatched to Asphalt Crew B.', NULL),
('CV-2026-9481', 'in_progress', 'Crew Mobilized on Site', 2, 'Foreman Dave Miller', 'Dept of Public Works', 'Hot-mix asphalt roller squad dispatched. Lane closure active.', NULL),
('CV-2026-9481', 'completed', 'Pavement Milling & Patch Complete', 2, 'Supervisor R. Vance', 'Public Works Inspector', 'Compacted hot-mix asphalt patch laid. Seams sealed. Verified photo uploaded.', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'),

('CV-2026-8812', 'reported', 'Citizen Dispatch Created', 1, 'Marcus Thorne', 'Citizen Reporter', 'Dumpster overflow reported with photo.', NULL),
('CV-2026-8812', 'in_progress', 'Sanitation Route Assigned', 2, 'Sanitation Supervisor', 'Dept of Sanitation', 'Route 14 emergency compaction truck scheduled for clearance.', NULL),

('CV-2026-7320', 'reported', 'Citizen Dispatch Created', 1, 'Aaliyah Patel', 'Citizen Reporter', 'Blackout lamps reported at subway entrance.', NULL),
('CV-2026-7320', 'accepted', 'Work Order #WO-884 Issued', 2, 'Grid Operations', 'Bureau of Street Lighting', 'Replacement LED ballasts and high-lift bucket truck dispatched.', NULL),

('CV-2026-6190', 'reported', 'Citizen Dispatch Created', 1, 'Kenji Sato', 'Citizen Reporter', 'Catch basin clogged, street pooling with storm runoff.', NULL),

('CV-2026-5541', 'reported', 'Citizen Dispatch Created', 1, 'Siddharth Verma', 'Citizen Reporter', 'Damaged swing anchor identified.', NULL),
('CV-2026-5541', 'completed', 'Hardware Replaced & Tested', 2, 'Parks Crew #2', 'Parks and Recreation', 'Replaced anchor shackles with rated stainless steel hardware.', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'),
('CV-2026-5541', 'citizen_verified', 'Citizen Certified Resolution', 1, 'Siddharth Verma', 'Community Verifier', 'Inspected swing set on site. Chains secured and tested with child load.', NULL);

-- 8. ISSUE ASSIGNMENTS
INSERT INTO issue_assignments (issue_id, department_id, assigned_to_user_id, assigned_by_user_id, status, notes) VALUES
('CV-2026-9481', 1, 2, 3, 'in_progress', 'Assigned to Public Works Field Squad for emergency pavement surfacing.');

-- 9. ISSUE SUPPORTS (One support per user per issue enforced)
INSERT INTO issue_supports (user_id, issue_id) VALUES
(1, 'CV-2026-9481'),
(1, 'CV-2026-5541');

-- 10. CITIZEN VERIFICATIONS
INSERT INTO citizen_verifications (issue_id, user_id, user_name, is_resolved, comment) VALUES
('CV-2026-5541', 1, 'Siddharth Verma', TRUE, 'Inspected swing set in person. Safe for children.');

-- 11. ISSUE REPORTS (Content Moderation & Flagging)
INSERT INTO issue_reports (issue_id, reported_by_id, reason, details, status) VALUES
('CV-2026-8812', 1, 'Duplicate Report', 'Commercial bin overflow was already noted by neighboring block association.', 'pending');
