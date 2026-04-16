-- Demo seed data for Facebook Clone (PostgreSQL / Neon)
-- Safe to run multiple times (uses ON CONFLICT / NOT EXISTS checks).

-- Users (accounts)
INSERT INTO users (id, first_name, last_name, email, password, profile_picture, cover_photo, bio, location, birthday)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Amina', 'Khan', 'amina@example.com',
   '$2a$10$/y9O8fIwcvCcUrsMAImzieAenAqHra6I9cuZG7n9HjTWlbZEZvYXW', -- "password123" (bcrypt, demo only)
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80',
   'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
   'Building little things with big vibes.', 'Lahore, PK', '1999-04-12'),
  ('22222222-2222-2222-2222-222222222222', 'Noah', 'Rivera', 'noah@example.com',
   '$2a$10$/y9O8fIwcvCcUrsMAImzieAenAqHra6I9cuZG7n9HjTWlbZEZvYXW',
   'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=256&h=256&q=80',
   'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
   'Coffee, cameras, code.', 'Austin, TX', '1996-09-03'),
  ('33333333-3333-3333-3333-333333333333', 'Zara', 'Ali', 'zara@example.com',
   '$2a$10$/y9O8fIwcvCcUrsMAImzieAenAqHra6I9cuZG7n9HjTWlbZEZvYXW',
   'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&h=256&q=80',
   'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80',
   'Designing calm, shipping fast.', 'Karachi, PK', '2001-01-26'),
  ('44444444-4444-4444-4444-444444444444', 'Ethan', 'Park', 'ethan@example.com',
   '$2a$10$/y9O8fIwcvCcUrsMAImzieAenAqHra6I9cuZG7n9HjTWlbZEZvYXW',
   'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80',
   'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
   'Learning in public.', 'Seoul, KR', '1998-06-18')
ON CONFLICT (email) DO NOTHING;

-- Ensure demo users always have the correct password (for existing rows from prior seeds)
UPDATE users
SET password = '$2a$10$/y9O8fIwcvCcUrsMAImzieAenAqHra6I9cuZG7n9HjTWlbZEZvYXW',
    updated_at = NOW()
WHERE email IN ('amina@example.com', 'noah@example.com', 'zara@example.com', 'ethan@example.com');

-- Friends (bidirectional)
INSERT INTO friends (user_id, friend_id)
SELECT a.user_id, a.friend_id
FROM (VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid),
  ('22222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid),
  ('11111111-1111-1111-1111-111111111111'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid),
  ('22222222-2222-2222-2222-222222222222'::uuid, '44444444-4444-4444-4444-444444444444'::uuid),
  ('44444444-4444-4444-4444-444444444444'::uuid, '22222222-2222-2222-2222-222222222222'::uuid)
) AS a(user_id, friend_id)
WHERE NOT EXISTS (
  SELECT 1 FROM friends f WHERE f.user_id = a.user_id AND f.friend_id = a.friend_id
);

-- Friend request (pending)
INSERT INTO friend_requests (from_id, to_id, status)
VALUES
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'pending')
ON CONFLICT (from_id, to_id) DO NOTHING;

-- Posts (with photos)
INSERT INTO posts (id, user_id, content, images, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
   'Weekend reset: sunshine, good food, and zero notifications for a bit.',
   ARRAY[
     'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
     'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'
   ]::text[],
   NOW() - INTERVAL '2 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222',
   'Tiny progress is still progress. Shipping one small improvement today.',
   ARRAY[]::text[],
   NOW() - INTERVAL '20 hours'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '33333333-3333-3333-3333-333333333333',
   'Moodboard dump: warm neutrals + bold blue accents.',
   ARRAY[
     'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=1200&q=80'
   ]::text[],
   NOW() - INTERVAL '8 hours'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '44444444-4444-4444-4444-444444444444',
   'Anyone else learning something new this week? Drop a topic.',
   ARRAY[]::text[],
   NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Post likes
INSERT INTO post_likes (post_id, user_id)
SELECT x.post_id, x.user_id
FROM (VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, '22222222-2222-2222-2222-222222222222'::uuid),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid, '11111111-1111-1111-1111-111111111111'::uuid)
) AS x(post_id, user_id)
WHERE NOT EXISTS (
  SELECT 1 FROM post_likes pl WHERE pl.post_id = x.post_id AND pl.user_id = x.user_id
);

-- Comments on posts
INSERT INTO comments (id, user_id, post_id, content, created_at)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
   'This looks like the perfect reset.', NOW() - INTERVAL '47 hours'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
   'Learning TypeScript better this week!', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (recipient_id, sender_id, type, post_id, comment_id, read, created_at)
SELECT n.recipient_id, n.sender_id, n.type, n.post_id, n.comment_id, n.read, n.created_at
FROM (VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'like', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, NULL::uuid, false, NOW() - INTERVAL '20 hours'),
  ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'comment', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid, false, NOW() - INTERVAL '19 hours'),
  ('33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'friend_request', NULL::uuid, NULL::uuid, false, NOW() - INTERVAL '1 day')
) AS n(recipient_id, sender_id, type, post_id, comment_id, read, created_at)
WHERE NOT EXISTS (
  SELECT 1
  FROM notifications nn
  WHERE nn.recipient_id = n.recipient_id
    AND nn.sender_id = n.sender_id
    AND nn.type = n.type
    AND COALESCE(nn.post_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(n.post_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND COALESCE(nn.comment_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(n.comment_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Stories
INSERT INTO stories (id, user_id, content, image, expires_at, created_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', 'Morning walk.', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80', NOW() + INTERVAL '18 hours', NOW() - INTERVAL '6 hours'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', '22222222-2222-2222-2222-222222222222', 'Studio day.', 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=900&q=80', NOW() + INTERVAL '22 hours', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Reels (use public sample mp4 urls)
INSERT INTO reels (id, user_id, video, caption, created_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', '33333333-3333-3333-3333-333333333333',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
   'Quick color grading test.', NOW() - INTERVAL '5 hours'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', '44444444-4444-4444-4444-444444444444',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
   'Learning: consistency beats motivation.', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Reel likes
INSERT INTO reel_likes (reel_id, user_id)
SELECT x.reel_id, x.user_id
FROM (VALUES
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid, '11111111-1111-1111-1111-111111111111'::uuid),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid, '22222222-2222-2222-2222-222222222222'::uuid)
) AS x(reel_id, user_id)
WHERE NOT EXISTS (
  SELECT 1 FROM reel_likes rl WHERE rl.reel_id = x.reel_id AND rl.user_id = x.user_id
);

-- Notes
INSERT INTO notes (id, user_id, title, content, music, is_public, created_at)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '11111111-1111-1111-1111-111111111111', 'Today', 'Small wins: hydrated, walked, shipped.', 'lofi', true, NOW() - INTERVAL '12 hours'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', '22222222-2222-2222-2222-222222222222', 'Ideas', 'A simple UI polish can change everything.', '', true, NOW() - INTERVAL '7 hours')
ON CONFLICT (id) DO NOTHING;

-- Messages
INSERT INTO messages (id, sender_id, recipient_id, content, read, created_at)
VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff1', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Hey! Want to test the new feed UI later?', false, NOW() - INTERVAL '4 hours'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff2', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
   'Yes — sending you a build soon.', false, NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

