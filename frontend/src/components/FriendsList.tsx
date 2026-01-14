import { useState, useEffect } from 'react';
import { useFriends } from '../hooks/useFriends';
import { api } from '../lib/api';

interface FriendsListProps {
    currentUserId: string | undefined;
}

interface FriendUser {
    id: string;
    name: string;
    avatarUrl?: string;
}

export default function FriendsList({ currentUserId }: FriendsListProps) {
    const { friends, loading, error, refetch } = useFriends();
    const [friendDetails, setFriendDetails] = useState<Map<string, FriendUser>>(new Map());
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (friends.length === 0 || !currentUserId) return;

        const fetchFriendDetails = async () => {
            setLoadingDetails(true);
            const detailsMap = new Map<string, FriendUser>();

            for (const friendship of friends) {
                // Determine which ID is the friend (not the current user)
                const friendId = friendship.requesterId === currentUserId
                    ? friendship.addresseeId
                    : friendship.requesterId;

                try {
                    const userData = await api.getUserById(friendId);
                    detailsMap.set(friendId, userData);
                } catch (err) {
                    console.error(`Failed to fetch details for user ${friendId}:`, err);
                }
            }

            setFriendDetails(detailsMap);
            setLoadingDetails(false);
        };

        fetchFriendDetails();
    }, [friends, currentUserId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-gray-600">Loading friends...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (friends.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No friends yet</p>
                <p className="text-sm mt-2">Search for users above to add friends!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">
                    Your Friends ({friends.length})
                </h3>
                <button
                    onClick={refetch}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Refresh
                </button>
            </div>

            {loadingDetails ? (
                <div className="text-center py-4 text-gray-500">Loading friend details...</div>
            ) : (
                <div className="space-y-2">
                    {friends.map((friendship) => {
                        const friendId = friendship.requesterId === currentUserId
                            ? friendship.addresseeId
                            : friendship.requesterId;

                        const friendUser = friendDetails.get(friendId);

                        return (
                            <div
                                key={friendship.friendshipId}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    {friendUser?.avatarUrl ? (
                                        <img
                                            src={friendUser.avatarUrl}
                                            alt={friendUser.name || 'Friend'}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-white font-semibold">
                                            {friendUser?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {friendUser?.name || 'Loading...'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Status: {friendship.status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

