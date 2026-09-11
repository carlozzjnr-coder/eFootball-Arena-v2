import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAward, FiTrendingUp, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();

  const menuItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiTrendingUp, label: 'Tournaments', path: '/tournaments' },
    { icon: FiAward, label: 'Matches', path: '/matches' },
    { icon: FiUsers, label: 'Rankings', path: '/rankings' },
    { icon: FiSettings, label: 'Admin', path: '/admin' }
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col">
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-blue-500">🎮 eFootball Arena</h1>
      </div>

      <nav className="flex-1 space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => dispatch(logout())}
        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition text-red-400 w-full"
      >
        <FiLogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
