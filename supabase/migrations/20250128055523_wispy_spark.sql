/*
  # Create files table and storage bucket

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `file_name` (text)
      - `storage_path` (text)
      - `encrypted_key` (text)
      - `iv` (text)
      - `public_key` (text)
      - `original_size` (bigint)
      - `mime_type` (text)
      - `created_at` (timestamptz)
      - `user_id` (uuid) - references auth.users

  2. Security
    - Enable RLS on `files` table
    - Add policies for authenticated users to manage their own files
*/

-- Create the files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  storage_path text NOT NULL,
  encrypted_key text NOT NULL,
  iv text NOT NULL,
  public_key text NOT NULL,
  original_size bigint NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);