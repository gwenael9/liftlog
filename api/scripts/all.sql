-- ==================== LIFTLOG DATA SETUP ====================
-- Récapitulatif complet de la base de données LiftLog
-- User ID: d6c2a588-171e-4210-b063-20b44ca20c2b
-- Date: 2026-07-16

-- ==================== 1. EXERCICES (35 total) ====================
INSERT INTO exercises (id, created_by, slug, muscle_group, is_global, notes, created_at, tracking_type) VALUES
('f160e8aa-7ff0-4e2d-9e28-dbfaac6c68df', NULL, 'bench_press', 'chest', true, NULL, '2026-05-09 09:25:06.198487+00', 'strength'),
('d52ccee4-2d04-492c-8c8e-04874f910dfc', NULL, 'incline_dumbbell_press', 'chest', true, NULL, '2026-05-09 09:25:06.231241+00', 'strength'),
('f6d097c5-f992-4997-abf3-f238cc95a8db', NULL, 'cable_fly', 'chest', true, NULL, '2026-05-09 09:25:06.249753+00', 'strength'),
('503db04b-18ad-4f2f-b0c1-641a622cb5e1', NULL, 'pull_up', 'back', true, NULL, '2026-05-09 09:25:06.266053+00', 'strength'),
('33fdc199-4686-4339-84bb-c5d351c35c0c', NULL, 'barbell_row', 'back', true, NULL, '2026-05-09 09:25:06.280848+00', 'strength'),
('4989acd6-d3e4-4194-b7c7-b0679b13c73c', NULL, 'lat_pulldown', 'back', true, NULL, '2026-05-09 09:25:06.295903+00', 'strength'),
('adcf254e-a504-4f62-a46f-c3dfb263539a', NULL, 'seated_cable_row', 'back', true, NULL, '2026-05-09 09:25:06.311092+00', 'strength'),
('8bfc9675-01cd-44ce-9010-6a717cee3569', NULL, 'overhead_press', 'shoulders', true, NULL, '2026-05-09 09:25:06.328944+00', 'strength'),
('ccedba25-9226-4900-abef-9cf93f4c7e4a', NULL, 'lateral_raise', 'shoulders', true, NULL, '2026-05-09 09:25:06.342592+00', 'strength'),
('0fc147aa-6796-425d-8a86-f68ad00c5f6b', NULL, 'face_pull', 'shoulders', true, NULL, '2026-05-09 09:25:06.357557+00', 'strength'),
('aa9b105f-dd58-486a-a18f-09882962e936', NULL, 'barbell_curl', 'biceps', true, 'o', '2026-05-09 09:25:06.372719+00', 'strength'),
('c5c277ee-d814-4e96-9e1e-03c82d3845be', NULL, 'hammer_curl', 'biceps', true, NULL, '2026-05-09 09:25:06.388181+00', 'strength'),
('260fe4c3-a043-4346-9c58-aabfcdb7c72a', NULL, 'tricep_pushdown', 'triceps', true, NULL, '2026-05-09 09:25:06.403935+00', 'strength'),
('625aac27-373a-4d6b-bee5-9a36606a7db4', NULL, 'skull_crusher', 'triceps', true, NULL, '2026-05-09 09:25:06.420898+00', 'strength'),
('0443d7c3-a326-47de-bcd3-c03fe2f9d37e', NULL, 'dips', 'triceps', true, NULL, '2026-05-09 09:25:06.436684+00', 'strength'),
('04aed820-c8b4-4d60-81f6-d05f0e75ee12', NULL, 'squat', 'legs', true, NULL, '2026-05-09 09:25:06.454029+00', 'strength'),
('86b6bc38-3864-4896-81cf-e8764feced18', NULL, 'romanian_deadlift', 'legs', true, NULL, '2026-05-09 09:25:06.469879+00', 'strength'),
('67c99cf8-4506-4a54-8f30-ec1876157b6d', NULL, 'leg_press', 'legs', true, NULL, '2026-05-09 09:25:06.483104+00', 'strength'),
('de76c6be-7e6e-4b66-bc07-bd1f247d12d6', NULL, 'leg_curl', 'legs', true, NULL, '2026-05-09 09:25:06.498633+00', 'strength'),
('1b610164-679c-43cb-981f-37ae2c43907b', NULL, 'calf_raise', 'legs', true, NULL, '2026-05-15 09:32:35.997723+00', 'strength'),
('d98d0bd7-8465-4afe-8df0-e6fe4b4941e3', NULL, 'plank', 'core', true, NULL, '2026-05-09 09:25:06.525713+00', 'duration'),
('59cc44f3-9844-44d8-8241-1c0d68c2b262', NULL, 'crunch', 'core', true, NULL, '2026-05-09 09:25:06.537921+00', 'strength'),
('406db95d-59e1-46a1-a602-d7d26634244f', NULL, 'hanging_leg_raise', 'core', true, NULL, '2026-05-09 09:25:06.552266+00', 'strength'),
('3cc96b7c-6e2b-4798-9310-4c401d04cdff', NULL, 'running', 'cardio', true, NULL, '2026-05-09 09:25:06.56409+00', 'duration'),
('ae90c29f-0852-4b24-a497-4cff240dc0c6', NULL, 'cycling', 'cardio', true, NULL, '2026-05-09 09:25:06.576622+00', 'duration'),
('72e26604-b9fa-4847-a4e6-d864a9177827', NULL, 'jump_rope', 'cardio', true, NULL, '2026-05-09 09:25:06.592718+00', 'duration'),
('f57c4096-4e09-4516-bca4-803148ce69fa', NULL, 'bulgarian_split_squat', 'legs', true, NULL, '2026-05-16 13:48:18.580543+00', 'strength'),
('9145e6d7-82be-4f63-810d-cdcacaa26117', NULL, 'unilateral_row', 'back', true, NULL, '2026-05-16 13:48:18.484038+00', 'strength'),
('30255898-ea2b-4ae3-8abe-ac81bae703ce', NULL, 'shrug_barbell', 'chest', true, NULL, '2026-07-05 21:04:36.695153+00', 'strength'),
('82787dc0-72eb-4a5b-a67a-08ae2d5623b5', NULL, 'chin_pull', 'back', true, NULL, '2026-07-05 21:03:38.425274+00', 'strength'),
('d7aef0ff-20c2-44d8-94c0-c8a26025880a', NULL, 'incline_curl', 'biceps', true, NULL, '2026-06-17 09:45:09.817998+00', 'strength'),
('aa1da54f-25a3-4d82-8efa-08292382550f', NULL, 'incline_barbell_press', 'chest', true, NULL, '2026-07-05 21:02:12.258001+00', 'strength'),
('441fe82b-4b90-49fb-87d6-e23b0e7a7e54', NULL, 'butterfly', 'chest', true, NULL, '2026-07-05 21:02:20.828923+00', 'strength'),
('3e149796-311b-46c3-ada2-68174131ab43', NULL, 'chest_press', 'chest', true, NULL, '2026-07-13 16:08:43.290436+00', 'strength'),
('71d5aeae-356b-43a9-b9cb-1cb6a62596c7', NULL, 'bench_dumbbell_press', 'chest', true, NULL, '2026-07-13 16:48:55.103354+00', 'strength'),
('04e0f1c3-2d8b-4a5e-9f6c-7f1b8e5c6d3a', NULL, 'deadlift', 'legs', true, NULL, '2026-07-13 16:49:05.103354+00', 'strength'),
('b7e1c2d4-3f5a-4b6e-9f7c-8e1b9e5c7d4a', NULL, 'hip_thrust', 'glutes', true, NULL, '2026-07-13 16:49:15.103354+00', 'strength'),
('c3d2e1f4-5a6b-4c7d-8e9f-0a1b2c3d4e5f', NULL, 'abduction', 'glutes', true, NULL, '2026-07-13 16:49:25.103354+00', 'strength'),
('d4e5f6a7-8b9c-4d0e-9f1a-2b3c4d5e6f7g', NULL, 'hack_squat', 'legs', true, NULL, '2026-07-13 16:49:35.103354+00', 'strength'),
('e5f6a7b8-9c0d-4e1f-8a2b-3c4d5e6f7g8h', NULL, 'leg_extension', 'legs', true, NULL, '2026-07-13 16:49:45.103354+00', 'strength'),
('f6a7b8c9-0d1e-4f2g-9b3c-4d5e6f7g8h9i', NULL, 'leg_extension_unilateral', 'legs', true, NULL, '2026-07-13 16:49:55.103354+00', 'strength'),
('a7b8c9d0-1e2f-4g3h-0c4d-5e6f7g8h9i0j', NULL, 'linear_leg_press', 'legs', true, NULL, '2026-07-13 16:50:05.103354+00', 'strength'),
('b8c9d0e1-2f3g-4h5i-1d6e-7f8g9h0i1j2k', NULL, 'low_pulley_curl', 'biceps', true, NULL, '2026-07-13 16:50:15.103354+00', 'strength'),
('c9d0e1f2-3g4h-5i6j-2e7f-8g9h0i1j2k3l', NULL, 'pumps', 'chest', true, NULL, '2026-07-13 16:50:25.103354+00', 'strength'),
('d0e1f2g3-4h5i-6j7k-3f8g-9h0i1j2k3l4m', NULL, 'dumbble_curl', 'biceps', true, NULL, '2026-07-13 16:50:35.103354+00', 'strength')
ON CONFLICT (id) DO NOTHING;

-- ==================== 2. WORKOUT TEMPLATES (3 total) ====================
INSERT INTO workout_templates (id, user_id, name, description, estimated_duration, created_at, is_public) VALUES
('b1f260cc-9340-4173-b575-b3ef8879ba5e', 'd6c2a588-171e-4210-b063-20b44ca20c2b', 'Push', NULL, 60, now(), false),
('f845da7b-a9fe-4f7c-a43d-f3aa6dd69faf', 'd6c2a588-171e-4210-b063-20b44ca20c2b', 'Pull', NULL, 60, now(), false),
('cec7dc7f-7634-4d41-a5df-27667e8f10e4', 'd6c2a588-171e-4210-b063-20b44ca20c2b', 'Legs', NULL, 60, now(), false)
ON CONFLICT (id) DO NOTHING;

-- ==================== 3. TEMPLATE EXERCISES (16 total) ====================
-- Push: 6 exercises
-- Pull: 5 exercises
-- Legs: 5 exercises
INSERT INTO template_exercises (id, template_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, target_duration_sec) VALUES
('7cfaab12-b987-4def-a546-06ee51c776ba', 'b1f260cc-9340-4173-b575-b3ef8879ba5e', 'f160e8aa-7ff0-4e2d-9e28-dbfaac6c68df', 1, 3, 8, 90, NULL),
('ef7d6989-40c8-4e67-88b0-337c74e12897', 'b1f260cc-9340-4173-b575-b3ef8879ba5e', 'd52ccee4-2d04-492c-8c8e-04874f910dfc', 2, 3, 8, 90, NULL),
('dc16e658-2483-4527-b879-ccf2bf5c276c', 'b1f260cc-9340-4173-b575-b3ef8879ba5e', '8bfc9675-01cd-44ce-9010-6a717cee3569', 3, 3, 8, 90, NULL),
('cb6462ce-5fa6-4e4e-880e-48fa57ff0f6c', 'b1f260cc-9340-4173-b575-b3ef8879ba5e', 'ccedba25-9226-4900-abef-9cf93f4c7e4a', 4, 3, 12, 60, NULL),
('62778597-f19d-49b5-876c-b3d4b5a0e377', 'b1f260cc-9340-4173-b575-b3ef8879ba5e', '260fe4c3-a043-4346-9c58-aabfcdb7c72a', 5, 3, 8, 60, NULL),
('a28a6ce2-d94a-49c1-ab98-1a3bb9467e93', 'b1f260cc-9340-4173-b575-b3ef8879ba5e', 'd98d0bd7-8465-4afe-8df0-e6fe4b4941e3', 6, 2, NULL, 30, 90),
('c9fd007b-641c-4b96-a4f9-1e3ca90395aa', 'f845da7b-a9fe-4f7c-a43d-f3aa6dd69faf', '4989acd6-d3e4-4194-b7c7-b0679b13c73c', 1, 4, 10, 90, NULL),
('cf376876-47f9-4c1d-b5d6-96597f92f376', 'f845da7b-a9fe-4f7c-a43d-f3aa6dd69faf', 'adcf254e-a504-4f62-a46f-c3dfb263539a', 2, 4, 10, 90, NULL),
('35dd9db2-7b33-4ce2-ae95-002cc17f8738', 'f845da7b-a9fe-4f7c-a43d-f3aa6dd69faf', '33fdc199-4686-4339-84bb-c5d351c35c0c', 3, 3, 8, 90, NULL),
('54751f5b-6548-4c36-948a-f2e32662e5f0', 'f845da7b-a9fe-4f7c-a43d-f3aa6dd69faf', 'd7aef0ff-20c2-44d8-94c0-c8a26025880a', 4, 3, 8, 90, NULL),
('10d62c88-4a02-4d28-9728-792b3b4a3493', 'f845da7b-a9fe-4f7c-a43d-f3aa6dd69faf', 'c5c277ee-d814-4e96-9e1e-03c82d3845be', 5, 3, 8, 90, NULL),
('9b1b5ae2-340b-40df-8a62-2665e5036d42', 'cec7dc7f-7634-4d41-a5df-27667e8f10e4', '04aed820-c8b4-4d60-81f6-d05f0e75ee12', 1, 3, 8, 90, NULL),
('cd54dae4-8c54-4b22-9039-40c56fc30b3d', 'cec7dc7f-7634-4d41-a5df-27667e8f10e4', '67c99cf8-4506-4a54-8f30-ec1876157b6d', 2, 3, 10, 90, NULL),
('3e0403af-dbfa-4a46-89e7-2a49f2258cfa', 'cec7dc7f-7634-4d41-a5df-27667e8f10e4', 'de76c6be-7e6e-4b66-bc07-bd1f247d12d6', 3, 3, 10, 90, NULL),
('f016b011-d5b7-4e77-9a0a-e88fd2586962', 'cec7dc7f-7634-4d41-a5df-27667e8f10e4', '1b610164-679c-43cb-981f-37ae2c43907b', 4, 3, 15, 60, NULL),
('0f93cc0b-e4b9-402e-8184-14b2e685452d', 'cec7dc7f-7634-4d41-a5df-27667e8f10e4', 'd98d0bd7-8465-4afe-8df0-e6fe4b4941e3', 5, 2, NULL, 30, 90)
ON CONFLICT (id) DO NOTHING;

-- ==================== 4. WORKOUT SESSIONS (3 total) ====================
INSERT INTO workout_sessions (id, user_id, template_id, scheduled_date, started_at, ended_at, notes) VALUES
('e9dff95d-82ba-4f78-95d2-350a3779cf49', 'd6c2a588-171e-4210-b063-20b44ca20c2b', 'f845da7b-a9fe-4f7c-a43d-f3aa6dd69faf', '2026-07-09', NULL, NULL, NULL),
('497383c3-5c70-49f5-b49a-353e724bddb4', 'd6c2a588-171e-4210-b063-20b44ca20c2b', 'b1f260cc-9340-4173-b575-b3ef8879ba5e', '2026-07-05', NULL, NULL, NULL),
('213b8745-08a0-4099-bd1b-c3a926761039', 'd6c2a588-171e-4210-b063-20b44ca20c2b', 'b1f260cc-9340-4173-b575-b3ef8879ba5e', '2026-07-12', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ==================== 5. SESSION SETS (Sets effectuées dans les sessions) ====================
INSERT INTO session_sets (id, session_id, exercise_id, set_index, reps, weight_kg, duration_sec, performed_at, exercise_order, segments) VALUES
-- Session Pull (e9dff95d-82ba-4f78-95d2-350a3779cf49)
('0e2f6526-190a-4fcb-a873-3adc1c2ef948', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', '503db04b-18ad-4f2f-b0c1-641a622cb5e1', 1, 10, 0.50, NULL, '2026-06-18 19:34:23.668+00', 0, NULL),
('67711342-5018-469c-a07b-1dc2a9c0618e', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', '4989acd6-d3e4-4194-b7c7-b0679b13c73c', 1, NULL, NULL, NULL, NULL, 0, NULL),
('9a24b009-4ad7-44cc-88f9-e069f3bd048e', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', '4989acd6-d3e4-4194-b7c7-b0679b13c73c', 2, NULL, NULL, NULL, NULL, 0, NULL),
('a210e3ad-22b5-447b-ba69-ebcc5f809c0c', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', '4989acd6-d3e4-4194-b7c7-b0679b13c73c', 3, NULL, NULL, NULL, NULL, 0, NULL),
('7a07c552-5eb2-42e5-bf20-4ef9789ebbef', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', '4989acd6-d3e4-4194-b7c7-b0679b13c73c', 4, NULL, NULL, NULL, NULL, 0, NULL),
('ddafb757-f3c8-40a3-96bf-4c750912e0e9', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'adcf254e-a504-4f62-a46f-c3dfb263539a', 1, NULL, NULL, NULL, NULL, 1, NULL),
('48a6c932-d6d5-42d7-87f9-1840d8e83cd0', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'adcf254e-a504-4f62-a46f-c3dfb263539a', 2, NULL, NULL, NULL, NULL, 1, NULL),
('a9d4ec23-3ffd-4d2d-aa64-73449d2a3c8f', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'adcf254e-a504-4f62-a46f-c3dfb263539a', 3, NULL, NULL, NULL, NULL, 1, NULL),
('0f6d2f82-90a9-4b15-9089-8627677f759e', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'adcf254e-a504-4f62-a46f-c3dfb263539a', 4, NULL, NULL, NULL, NULL, 1, NULL),
('fa0eb927-8160-4fe9-bac7-bbb45b45a9e2', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', '33fdc199-4686-4339-84bb-c5d351c35c0c', 1, 10, 40.00, NULL, NULL, 2, NULL),
('aa47ab24-0039-4b24-8871-8d29a0dec6d6', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', '33fdc199-4686-4339-84bb-c5d351c35c0c', 2, 8, 50.00, NULL, NULL, 2, NULL),
('bfba346f-8575-4b31-89ba-c1593187156c', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', '33fdc199-4686-4339-84bb-c5d351c35c0c', 3, 6, 50.00, NULL, NULL, 2, NULL),
('341b89cb-2e00-4d30-ab61-20ed16eea94f', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'd7aef0ff-20c2-44d8-94c0-c8a26025880a', 1, 8, 8.00, NULL, NULL, 3, NULL),
('a1684966-fecb-48c9-ae4e-7aa0e3343613', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'd7aef0ff-20c2-44d8-94c0-c8a26025880a', 2, 6, 8.00, NULL, NULL, 3, NULL),
('024d7618-4630-40fd-ae55-5b401b0f3aa6', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'd7aef0ff-20c2-44d8-94c0-c8a26025880a', 3, 4, 8.00, NULL, NULL, 3, '[{"reps": 4, "weight_kg": 8}, {"reps": 4, "weight_kg": 6}]'),
('4a13ec90-3993-4ebe-9660-e062922f12e4', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'c5c277ee-d814-4e96-9e1e-03c82d3845be', 1, 4, 10.00, NULL, NULL, 4, '[{"reps": 4, "weight_kg": 10}, {"reps": 3, "weight_kg": 8}]'),
('544bcde0-d6c8-43b7-9c78-6bce9fa19a5c', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'c5c277ee-d814-4e96-9e1e-03c82d3845be', 2, 6, 8.00, NULL, NULL, 4, '[{"reps": 6, "weight_kg": 8}, {"reps": 4, "weight_kg": 6}]'),
('09f47ed9-9b87-4f4f-8723-aa50cb16bc5a', 'e9dff95d-82ba-4f78-95d2-350a3779cf49', 'c5c277ee-d814-4e96-9e1e-03c82d3845be', 3, 6, 8.00, NULL, NULL, 4, '[{"reps": 6, "weight_kg": 8}, {"reps": 4, "weight_kg": 6}]'),
-- Session Push (497383c3-5c70-49f5-b49a-353e724bddb4)
('e64ada5b-616c-48f1-8087-e91a5562fbab', '497383c3-5c70-49f5-b49a-353e724bddb4', 'f160e8aa-7ff0-4e2d-9e28-dbfaac6c68df', 1, NULL, NULL, NULL, NULL, 0, NULL),
('ad08af4f-6871-4127-84a0-e21e600e8f74', '497383c3-5c70-49f5-b49a-353e724bddb4', 'f160e8aa-7ff0-4e2d-9e28-dbfaac6c68df', 2, NULL, NULL, NULL, NULL, 0, NULL),
('8bc80169-399e-4540-81da-0f0c9759a92f', '497383c3-5c70-49f5-b49a-353e724bddb4', 'f160e8aa-7ff0-4e2d-9e28-dbfaac6c68df', 3, NULL, NULL, NULL, NULL, 0, NULL),
('1eead623-69b2-4378-9ac0-147d69d02f06', '497383c3-5c70-49f5-b49a-353e724bddb4', 'd52ccee4-2d04-492c-8c8e-04874f910dfc', 1, NULL, NULL, NULL, NULL, 1, NULL),
('fb764684-b0d9-45ae-8b49-1c4a9647f8f6', '497383c3-5c70-49f5-b49a-353e724bddb4', 'd52ccee4-2d04-492c-8c8e-04874f910dfc', 2, NULL, NULL, NULL, NULL, 1, NULL),
('f05a14f5-be7c-4b3a-bbe4-a1de35e1b617', '497383c3-5c70-49f5-b49a-353e724bddb4', 'd52ccee4-2d04-492c-8c8e-04874f910dfc', 3, NULL, NULL, NULL, NULL, 1, NULL),
('16cb4f5b-e83a-4f1b-bc7c-19a3c3e2d6f8', '497383c3-5c70-49f5-b49a-353e724bddb4', '8bfc9675-01cd-44ce-9010-6a717cee3569', 1, NULL, NULL, NULL, NULL, 2, NULL),
('2f7b5c6d-91e2-4a8c-b3d9-e8f4c1a2b5d3', '497383c3-5c70-49f5-b49a-353e724bddb4', '8bfc9675-01cd-44ce-9010-6a717cee3569', 2, NULL, NULL, NULL, NULL, 2, NULL),
('3a8c6d7e-a2f3-4b9d-c4e0-f9f5c2b3c6d4', '497383c3-5c70-49f5-b49a-353e724bddb4', '8bfc9675-01cd-44ce-9010-6a717cee3569', 3, NULL, NULL, NULL, NULL, 2, NULL),
('4b9d7e8f-b3f4-4c0e-d5e1-00f6c3b4c6d5', '497383c3-5c70-49f5-b49a-353e724bddb4', 'ccedba25-9226-4900-abef-9cf93f4c7e4a', 1, NULL, NULL, NULL, NULL, 3, NULL),
('5c0e8f90-c4f5-4d1f-e6e2-11f7c4b5d7e6', '497383c3-5c70-49f5-b49a-353e724bddb4', 'ccedba25-9226-4900-abef-9cf93f4c7e4a', 2, NULL, NULL, NULL, NULL, 3, NULL),
('6d1f9f01-d5f6-4e2f-f7e3-22f8c5b6d8e7', '497383c3-5c70-49f5-b49a-353e724bddb4', 'ccedba25-9226-4900-abef-9cf93f4c7e4a', 3, NULL, NULL, NULL, NULL, 3, NULL),
('7e2f0f12-e6f7-4f3f-f8e4-33f9c6b7d9e8', '497383c3-5c70-49f5-b49a-353e724bddb4', '260fe4c3-a043-4346-9c58-aabfcdb7c72a', 1, NULL, NULL, NULL, NULL, 4, NULL),
('8f3f1f23-f7f8-4f4f-f9e5-44fac7b8dae9', '497383c3-5c70-49f5-b49a-353e724bddb4', '260fe4c3-a043-4346-9c58-aabfcdb7c72a', 2, NULL, NULL, NULL, NULL, 4, NULL),
('9f4f2f34-f8f9-4f5f-fae6-55fbcab9dbea', '497383c3-5c70-49f5-b49a-353e724bddb4', '260fe4c3-a043-4346-9c58-aabfcdb7c72a', 3, NULL, NULL, NULL, NULL, 4, NULL),
('0f5f3f45-f9fa-4f6f-fbe7-66fccbbadcfb', '497383c3-5c70-49f5-b49a-353e724bddb4', 'd98d0bd7-8465-4afe-8df0-e6fe4b4941e3', 1, NULL, NULL, NULL, NULL, 5, NULL),
('1f6f4f56-fafb-4f7f-fcf8-77fdcccbedfc', '497383c3-5c70-49f5-b49a-353e724bddb4', 'd98d0bd7-8465-4afe-8df0-e6fe4b4941e3', 2, NULL, NULL, NULL, NULL, 5, NULL),
-- Session Push (213b8745-08a0-4099-bd1b-c3a926761039)
('dbf639ad-18c1-49b6-83fa-33186e0899d1', '213b8745-08a0-4099-bd1b-c3a926761039', '71d5aeae-356b-43a9-b9cb-1cb6a62596c7', 1, 12, 18.00, NULL, '2026-07-13 16:56:12.543+00', 0, NULL),
('c4725d37-db96-49b5-9046-c93d8c59a44b', '213b8745-08a0-4099-bd1b-c3a926761039', '71d5aeae-356b-43a9-b9cb-1cb6a62596c7', 2, 8, 20.00, NULL, '2026-07-13 16:56:12.543+00', 0, NULL),
('04434a9a-5a71-4682-b753-044ab42660a7', '213b8745-08a0-4099-bd1b-c3a926761039', '260fe4c3-a043-4346-9c58-aabfcdb7c72a', 3, 5, 13.00, NULL, NULL, 4, '[{"reps": 5, "weight_kg": 13}, {"reps": 3, "weight_kg": 9.5}, {"reps": 7, "weight_kg": 6}]'),
('f80122b6-6142-40ec-8512-9b1e566749a1', '213b8745-08a0-4099-bd1b-c3a926761039', 'd98d0bd7-8465-4afe-8df0-e6fe4b4941e3', 1, NULL, NULL, 90, NULL, 5, NULL),
('6c3be668-4411-4bd8-8923-a0a9fb74e8d3', '213b8745-08a0-4099-bd1b-c3a926761039', 'd98d0bd7-8465-4afe-8df0-e6fe4b4941e3', 2, NULL, NULL, 90, NULL, 5, NULL),
('10ec9d24-96f0-43c0-b396-ea9a7321c324', '213b8745-08a0-4099-bd1b-c3a926761039', '71d5aeae-356b-43a9-b9cb-1cb6a62596c7', 3, 6, 20.00, NULL, '2026-07-13 16:56:12.543+00', 0, NULL),
('b5499594-610d-479c-806a-84c023117e69', '213b8745-08a0-4099-bd1b-c3a926761039', 'aa1da54f-25a3-4d82-8efa-08292382550f', 1, 5, 40.00, NULL, '2026-07-13 16:56:12.543+00', 1, NULL),
('db6c50b6-abb4-477c-a5a7-537b0d83650a', '213b8745-08a0-4099-bd1b-c3a926761039', 'aa1da54f-25a3-4d82-8efa-08292382550f', 2, 6, 40.00, NULL, '2026-07-13 16:56:12.543+00', 1, NULL),
('4e9b54a0-15e2-4efc-9d07-2ebbdb081ac3', '213b8745-08a0-4099-bd1b-c3a926761039', 'aa1da54f-25a3-4d82-8efa-08292382550f', 3, 6, 40.00, NULL, '2026-07-13 16:56:12.543+00', 1, NULL),
('3683aefa-6121-4f27-b84d-6d2b003d4be3', '213b8745-08a0-4099-bd1b-c3a926761039', '3e149796-311b-46c3-ada2-68174131ab43', 1, 12, 30.00, NULL, '2026-07-13 16:56:12.543+00', 2, NULL),
('bdd6d772-92fd-480b-bf56-3e7c209edced', '213b8745-08a0-4099-bd1b-c3a926761039', '3e149796-311b-46c3-ada2-68174131ab43', 2, 8, 37.50, NULL, '2026-07-13 16:56:12.543+00', 2, NULL),
('468dd9e1-b696-4110-aae8-ca8a236e0e36', '213b8745-08a0-4099-bd1b-c3a926761039', '3e149796-311b-46c3-ada2-68174131ab43', 3, 8, 37.50, NULL, '2026-07-13 16:56:12.543+00', 2, NULL),
('cb2490dd-05f1-4c81-ae24-7dba3f7e8c90', '213b8745-08a0-4099-bd1b-c3a926761039', 'ccedba25-9226-4900-abef-9cf93f4c7e4a', 1, 15, 2.50, NULL, NULL, 3, NULL),
('8a755682-02ad-4ce6-9785-d090b555081a', '213b8745-08a0-4099-bd1b-c3a926761039', 'ccedba25-9226-4900-abef-9cf93f4c7e4a', 2, 8, 6.00, NULL, NULL, 3, '[{"reps": 8, "weight_kg": 6}, {"reps": 4, "weight_kg": 2.5}]'),
('78eeb354-9a79-4f0d-b88c-2596b08ed7f1', '213b8745-08a0-4099-bd1b-c3a926761039', 'ccedba25-9226-4900-abef-9cf93f4c7e4a', 3, 15, 2.50, NULL, NULL, 3, NULL),
('17fc1c0f-0269-45f8-943b-7d1fc401d2c1', '213b8745-08a0-4099-bd1b-c3a926761039', '260fe4c3-a043-4346-9c58-aabfcdb7c72a', 1, 10, 13.00, NULL, NULL, 4, NULL),
('cb5e8e48-0966-4eb8-b5ea-d4c2c77d07a4', '213b8745-08a0-4099-bd1b-c3a926761039', '260fe4c3-a043-4346-9c58-aabfcdb7c72a', 2, 8, 13.00, NULL, NULL, 4, '[{"reps": 8, "weight_kg": 13}, {"reps": 4, "weight_kg": 9.5}]')
ON CONFLICT (id) DO NOTHING;

-- ==================== SUMMARY ====================
-- Total: 35 Exercises + 3 Templates + 16 Template_Exercises + 3 Sessions + 38 Session_Sets
-- User: d6c2a588-171e-4210-b063-20b44ca20c2b
-- All records inserted with ON CONFLICT DO NOTHING to avoid duplicate key errors