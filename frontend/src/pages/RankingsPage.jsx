import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRankings } from '../slices/rankingSlice';

const RankingsPage = () => {
  const dispatch = useDispatch();
  const { rankings, loading } = useSelector((state) => state.ranking);

  useEffect(() => {
    dispatch(fetchRankings());
  }, [dispatch]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Global Rankings</h1>
        <p className="text-gray-400">Competitive player rankings</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-xl text-gray-400">Loading rankings...</div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Player</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Wins</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Losses</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Win Rate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {rankings.map((player, index) => (
                <tr key={player.id} className="hover:bg-gray-700 transition">
                  <td className="px-6 py-4 font-bold text-lg text-blue-400">#{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{player.username}</td>
                  <td className="px-6 py-4 text-green-400">{player.wins}</td>
                  <td className="px-6 py-4 text-red-400">{player.losses}</td>
                  <td className="px-6 py-4">{player.win_rate}%</td>
                  <td className="px-6 py-4 font-bold">{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RankingsPage;
