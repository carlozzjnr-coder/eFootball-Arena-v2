import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to eFootball Arena v2</h1>
        <p className="text-xl text-gray-100 mb-8">Join the professional esports tournament platform</p>
        <div className="flex gap-4 justify-center">
          <Link to="/tournaments" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
            Browse Tournaments
          </Link>
          <Link to="/rankings" className="border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600">
            View Rankings
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Active Players</h3>
          <p className="text-3xl font-bold text-blue-400">2,547</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Tournaments</h3>
          <p className="text-3xl font-bold text-green-400">42</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Matches Played</h3>
          <p className="text-3xl font-bold text-purple-400">8,934</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Prize Pool</h3>
          <p className="text-3xl font-bold text-yellow-400">$125K</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-3">🏆 Tournaments</h3>
          <p className="text-gray-400">Participate in competitive tournaments with brackets and real-time scoring.</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-3">📊 Rankings</h3>
          <p className="text-gray-400">Track your rating and compete for the top positions on the leaderboard.</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-3">💬 Community</h3>
          <p className="text-gray-400">Connect with other players and join live tournament chat rooms.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
