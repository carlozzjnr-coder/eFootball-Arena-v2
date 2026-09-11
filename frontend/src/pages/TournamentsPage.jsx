import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments } from '../slices/tournamentSlice';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiAward } from 'react-icons/fi';

const TournamentsPage = () => {
  const dispatch = useDispatch();
  const { tournaments, loading } = useSelector((state) => state.tournament);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Tournaments</h1>
        <p className="text-gray-400">Discover and join competitive tournaments</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-xl text-gray-400">Loading tournaments...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              to={`/tournaments/${tournament.id}`}
              className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition overflow-hidden hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h3 className="text-xl font-bold">{tournament.name}</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-400 text-sm line-clamp-2">{tournament.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiCalendar size={16} />
                    <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUsers size={16} />
                    <span>{tournament.current_players || 0} / {tournament.max_players} Players</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiAward size={16} />
                    <span>Prize: ${tournament.prize_pool}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                    {tournament.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;
