import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Users, TrendingUp, Briefcase, User as UserIcon } from 'lucide-react';
import Button from '../ui/Button';
import { RiAuctionLine } from 'react-icons/ri';

const MobileStickyNav = () => {
  const location = useLocation();
  const [role, setRole] = useState(null);

  // load user role once on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      setRole(user.role);
    }
  }, []);

  const isAdmin   = role === 'admin';
  const isTemp    = role === 'temp-admin';

  // admin (and temp-admin) items
  const adminItems = [
    { label: 'Auctions', icon: <RiAuctionLine />,     href: '/admins-my-auction-info' },
    { label: 'Players',  icon: <Users />,               href: '/admin-players-info' },
    { label: 'Teams',    icon: <Briefcase />,           href: '/admin-teams-info' },
    { label: 'Users',    icon: <Users />,               href: '/admin-users-info' },
  ];

  // normal user items
  const userItems = [
    { label: 'Dashboard',  icon: <Home />,              href: '/dashboard' },
    { label: 'All Auctions', icon: <TrendingUp />,     href: '/admin-auction-info' },
    { label: 'Profile',    icon: <UserIcon />,          href: '/admin-profile' },
  ];

  const items = (isAdmin || isTemp) ? adminItems : userItems;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-1 flex justify-around md:hidden rounded-xl">
      {items.map(item => {
        const isActive = location.pathname === item.href;
        return (
          <Button
            key={item.label}
            variant={isActive ? 'primary' : 'ghost'}
            className="flex flex-col items-center justify-center"
            onClick={() => window.location.href = item.href}
          >
            {React.cloneElement(item.icon, {
              className: `h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`
            })}
            <span className={`mt-1 text-xs ${isActive ? 'text-white' : 'text-gray-600'}`}>
              {item.label}
            </span>
          </Button>
        );
      })}
    </nav>
  );
};

export default MobileStickyNav;
