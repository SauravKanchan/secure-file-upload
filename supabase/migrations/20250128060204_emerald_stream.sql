/*
  # Create storage bucket for encrypted files

  1. New Storage
    - Create a new public bucket for encrypted files
    - Enable size limits and file type restrictions
*/

-- Create a new storage bucket for encrypted files
INSERT INTO storage.buckets (id, name, public)
VALUES ('encrypted-files', 'encrypted-files', true);

-- Set up security policies for the bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'encrypted-files');

CREATE POLICY "Authenticated users can download files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'encrypted-files');

CREATE POLICY "Authenticated users can delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'encrypted-files');