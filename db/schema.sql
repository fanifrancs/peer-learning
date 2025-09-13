-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    profile_picture TEXT,   -- URL or file path
    age INT,
    whatsapp VARCHAR(20)    -- phone number as string
);

-- SKILLS TABLE
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    UNIQUE (user_email, skill) -- prevent duplicate skills per user
);

-- TRAINERS TABLE
CREATE TABLE IF NOT EXISTS trainers (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    teach TEXT NOT NULL,          -- short sentence describing what they can teach
    expertise_level INT NOT NULL, -- e.g. 1 = beginner, 5 = expert
    UNIQUE (user_email, teach)    -- prevent duplicates
);

-- LEARNING TABLE (trainer ↔ student relationship only)
CREATE TABLE IF NOT EXISTS learning (
    id SERIAL PRIMARY KEY,
    trainer_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    student_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    UNIQUE (trainer_email, student_email), -- avoid duplicates
    CHECK (trainer_email <> student_email) -- no self-learning link
);