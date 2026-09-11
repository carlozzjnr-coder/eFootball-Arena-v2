import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl text-gray-400 mb-8">Page not found</p>
      <Link to="/" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
