
import React from 'react';
import { Player } from '@/services/playerService';
import { PlayerRow } from './PlayerRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LeaderboardTableProps {
  players: Player[];
  onPlayerClick: (player: Player) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  players,
  onPlayerClick,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center">Region</TableHead>
            <TableHead className="text-center">Device</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, index) => (
            <PlayerRow
              key={player.id}
              position={index + 1}
              displayName={player.ign}
              avatar={player.avatar_url || undefined}
              points={player.global_points || 0}
              country={player.region || undefined}
              device={player.device || undefined}
              onClick={() => onPlayerClick(player)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
