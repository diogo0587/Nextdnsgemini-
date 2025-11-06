import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white p-4 shadow-md flex items-center justify-between">
      <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
      {/* Could add user profile, notifications, etc. here */}
    </header>
  );
};

export default Header;
