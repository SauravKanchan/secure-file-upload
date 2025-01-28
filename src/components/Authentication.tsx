import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Make sure you have a supabaseClient.js file for Supabase setup.

export const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuth = async () => {
    try {
      let response;
      if (isLogin) {
        response = await supabase.auth.signInWithPassword({ email, password });
      } else {
        response = await supabase.auth.signUp({ email, password });
      }

      if (response.error) {
        setErrorMessage(response.error.message);
      } else {
        setErrorMessage('');
        alert(isLogin ? 'Logged in successfully!' : 'Sign-up successful! Check your email for verification.');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}
      <div className="space-y-4">
        <input
          type="email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleAuth}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        <p className="text-center text-gray-600 mt-4">
          {isLogin ? 'Don’t have an account?' : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-bold ml-1"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};
