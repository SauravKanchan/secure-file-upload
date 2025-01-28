import React, { useEffect, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  importKey,
  decryptFile,
  base64ToArrayBuffer,
} from '../lib/crypto';

interface FileRecord {
  id: string;
  file_name: string;
  storage_path: string;
  encrypted_key: string;
  iv: string;
  created_at: string;
  mime_type: string;
}

export function FileList() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileRecord) => {
    try {
      // Get the private key from user (in production, this should be more secure)
      const privateKey = prompt('Enter your private key to decrypt the file:');
      if (!privateKey) return;

      // Download encrypted file from storage
      const { data, error: downloadError } = await supabase.storage
        .from('encrypted-files')
        .download(file.storage_path);

      if (downloadError) throw downloadError;

      // Import the AES key
      const keyData = base64ToArrayBuffer(file.encrypted_key);
      const iv = base64ToArrayBuffer(file.iv);
      const aesKey = await importKey(keyData);

      // Decrypt the file
      const decryptedData = await decryptFile(
        await data.arrayBuffer(),
        aesKey,
        new Uint8Array(iv)
      );

      // Create and download the decrypted file
      const blob = new Blob([decryptedData], { type: file.mime_type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download and decrypt file. Please check your private key.');
    }
  };

  const handleDelete = async (file: FileRecord) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('encrypted-files')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      setFiles(files.filter(f => f.id !== file.id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete file');
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Your health records</h2>
      {files.length === 0 ? (
        <p className="text-gray-500 text-center">No files uploaded yet</p>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file_name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(file)}
                  className="p-2 text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}