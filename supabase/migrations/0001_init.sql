-- Phase 1: Core Tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE semesters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  semester_id INT REFERENCES semesters(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED
);

CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  note_id INT REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Phase 2: Collaboration & Growth Tables
CREATE TABLE note_collaborators (
  id SERIAL PRIMARY KEY,
  note_id INT REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

CREATE TABLE note_versions (
  id SERIAL PRIMARY KEY,
  note_id INT REFERENCES notes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  version INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE moderation_queue (
  id SERIAL PRIMARY KEY,
  note_id INT REFERENCES notes(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  review_comment TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

CREATE INDEX notes_search_idx ON notes USING GIN(search_vector);
CREATE INDEX subjects_semester_idx ON subjects(semester_id);
CREATE INDEX notes_subject_idx ON notes(subject_id);
CREATE INDEX moderation_status_idx ON moderation_queue(status);
CREATE INDEX note_versions_note_idx ON note_versions(note_id);
