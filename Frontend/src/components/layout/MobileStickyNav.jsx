import React from 'react';
import { useLocation } from 'react-router-dom';
import { Users, TrendingUp, Briefcase } from 'lucide-react';
import Button from '../ui/Button';
import { RiAuctionLine } from 'react-icons/ri';

/**
 * MobileStickyNav
 * A bottom sticky navigation bar for mobile screens only.
 * Highlights the active page based on the current route.
 */
const MobileStickyNav = () => {
  const location = useLocation();
  const items = [
    { label: 'Auctions', icon: <RiAuctionLine className="h-5 w-5" />, href: '/admins-my-auction-info' },
    { label: 'Players', icon: <Users className="h-5 w-5" />, href: '/admin-players-info' },
    { label: 'Teams', icon: <Briefcase className="h-5 w-5" />, href: '/admin-teams-info' },
    { label: 'Users', icon: <Users className="h-5 w-5" />, href: '/admin-users-info' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-1 flex justify-around md:hidden rounded-xl">
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Button
            key={item.label}
            variant={isActive ? 'primary' : 'ghost'}
            className="flex flex-col items-center justify-center"
            onClick={() => window.location.href = item.href}
          >
            {React.cloneElement(item.icon, { className: `h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 '}` })}
            <span className={`mt-1 text-xs ${isActive ? 'text-white' : 'text-gray-600'}`}>{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
};

export default MobileStickyNav;
