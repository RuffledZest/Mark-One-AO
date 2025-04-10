'use client';

import { useState } from 'react';
import { createTeam } from '../utils/teamUtils';

export default function TeamCreation() {
  const [teamName, setTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const teamId = await createTeam({ name: teamName });
      setSuccess(`Team created successfully! ID: ${teamId}`);
      setTeamName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create Team</h2>
      
      <form onSubmit={handleCreateTeam} className="space-y-4">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
            Team Name
          </label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter team name"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isCreating || !teamName}
          className={`w-full px-4 py-2 text-white rounded ${
            isCreating || !teamName
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isCreating ? 'Creating...' : 'Create Team'}
        </button>

        {error && (
          <div className="mt-2 p-2 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-2 p-2 text-green-700 bg-green-100 rounded">
            {success}
          </div>
        )}
      </form>
    </div>
  );
} 