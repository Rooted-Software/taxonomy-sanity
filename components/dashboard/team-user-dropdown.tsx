'use client'

import { useState } from 'react';
import { Icons } from '../icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { TeamUserChangeRole } from './team-user-change-role';
import { TeamUserRemove } from './team-user-remove';



const TeamUserDropdown = ({ user, teamuser }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const handleCloseDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={(open) => setDropdownOpen(open)}>
      <DropdownMenuTrigger
        className=
        'border-transparent px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
      >
        <Icons.ellipsis className="mr-2 h-4 w-4" />

      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {user.id == teamuser.id ? (

          <DropdownMenuItem>
            <Icons.lock className="mr-2 h-4 w-4" /> You cannot remove yourself
          </DropdownMenuItem>

        ) : teamuser.role == 'admin' ? (

          <DropdownMenuItem>
            <Icons.lock className="mr-2 h-4 w-4" />  You cannot remove admins
          </DropdownMenuItem>
        ) : (
          <TeamUserRemove user={teamuser} onClose={handleCloseDropdown} />
        )}
        <TeamUserChangeRole user={teamuser} onClose={handleCloseDropdown} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TeamUserDropdown;
