import { useState } from 'react';
import { api } from '../lib/api';

interface User {
    id: string;
    name: string;
    avatarUrl: string | null;
}

interface UserSearchProps {
    currentUserId?: string;
}

export default function UserSearch({ currentUserId }: UserSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addingFriend, setAddingFriend] = useState<string | null>(null);
    const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setUsers([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await api.searchUsers(searchTerm);
            // Filter out current user from results
            const filteredUsers = data.users.filter((user: User) => user.id !== currentUserId);
            setUsers(filteredUsers);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (friendId: string) => {
        setAddingFriend(friendId);
        setError(null);

        try {
            await api.addFriend(friendId);
            // Mark friend as added
            setAddedFriends(prev => new Set(prev).add(friendId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add friend');
        } finally {
            setAddingFriend(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search users by name..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Results */}
            {users.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700">Search Results:</h3>
                    <div className="space-y-2">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-medium text-gray-900">{user.name}</span>
                                </div>

                                {addedFriends.has(user.id) ? (
                                    <span className="text-green-600 font-medium">✓ Friend Added</span>
                                ) : (
                                    <button
                                        onClick={() => handleAddFriend(user.id)}
                                        disabled={addingFriend === user.id}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {addingFriend === user.id ? 'Adding...' : 'Add Friend'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Results */}
            {!loading && searchTerm && users.length === 0 && !error && (
                <div className="text-center text-gray-500 py-4">
                    No users found matching "{searchTerm}"
                </div>
            )}
        </div>
    );
}

