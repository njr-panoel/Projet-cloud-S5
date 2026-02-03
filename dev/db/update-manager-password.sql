-- SQL to update manager password hash (run in the database)
-- Password set to: Password123!
UPDATE users
SET password = '$2b$12$6GinaQ.A4G/kovg1Tedane4wqRpsAR2eSXC1/3C9jMJ1vADpRYOjK'
WHERE email = 'manager@test.com';

-- Verify:
-- SELECT email, password FROM users WHERE email = 'manager@test.com';
