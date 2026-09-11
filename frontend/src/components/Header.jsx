import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiSearch, FiBell } from 'react-icons/fi';
import { toggleSidebar } from '../slices/uiSlice';

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="text-gray-400 hover:text-white"
        >
          <FiMenu size={24} />
        </button>
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
          <FiSearch size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none w-48"
          />
        </div>

        <button className="relative text-gray-400 hover:text-white">
          <FiBell size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-gray-700">
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.email}</p>
            <p className="text-xs text-gray-400">Player</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
      </div>
    </header>
  );
};

export default Header;
