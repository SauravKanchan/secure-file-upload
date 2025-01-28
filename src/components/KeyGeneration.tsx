import React, { useState } from 'react';
import { Key, Copy, RefreshCw } from 'lucide-react';
import { generateRSAKeyPair, exportRSAKey, exportRSAPrivateKey } from '../lib/crypto';

export function KeyGeneration() {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateKeys = async () => {
    try {
      setGenerating(true);
      const keyPair = await generateRSAKeyPair();
      const exportedPublicKey = await exportRSAKey(keyPair.publicKey);
      const exportedPrivateKey = await exportRSAPrivateKey(keyPair.privateKey);
      
      setPublicKey(exportedPublicKey);
      setPrivateKey(exportedPrivateKey);
    } catch (error) {
      console.error('Error generating keys:', error);
      alert('Failed to generate keys. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Key className="w-6 h-6 mr-2 text-indigo-600" />
          RSA Key Pair Generation
        </h2>
        <button
          onClick={generateKeys}
          disabled={generating}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
          Generate New Keys
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Public Key</label>
            {publicKey && (
              <button
                onClick={() => copyToClipboard(publicKey)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              value={publicKey}
              readOnly
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 font-mono text-sm"
              placeholder="Generated public key will appear here..."
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Private Key</label>
            {privateKey && (
              <button
                onClick={() => copyToClipboard(privateKey)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              value={privateKey}
              readOnly
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 font-mono text-sm"
              placeholder="Generated private key will appear here..."
            />
          </div>
          {privateKey && (
            <p className="mt-2 text-sm text-red-600">
              ⚠️ Keep your private key secure and never share it with anyone!
            </p>
          )}
        </div>
      </div>

      {(publicKey || privateKey) && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to use these keys:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Copy and save both keys securely</li>
            <li>Use the public key when uploading files</li>
            <li>Keep the private key safe - you'll need it to decrypt files</li>
            <li>Generate new keys anytime for better security</li>
          </ol>
        </div>
      )}
    </div>
  );
}