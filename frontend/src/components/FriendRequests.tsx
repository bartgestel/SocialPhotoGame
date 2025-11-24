import { useState, useEffect } from 'react';
import { useFriendRequests } from '../hooks/useFriendRequests';
import { api } from '../lib/api';

interface RequesterUser {
    id: string;
    name: string;
    avatarUrl?: string | null;
}

export default function FriendRequests() {
    const { requests, loading, error, refetch, respondToRequest } = useFriendRequests();
    const [requesterDetails, setRequesterDetails] = useState<Map<string, RequesterUser>>(new Map());
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);

    useEffect(() => {
        if (requests.length === 0) return;

        const fetchRequesterDetails = async () => {
            setLoadingDetails(true);
            const detailsMap = new Map<string, RequesterUser>();

            for (const request of requests) {
                try {
                    const userData = await api.getUserById(request.requesterId);
                    detailsMap.set(request.requesterId, userData);
                } catch (err) {
                    console.error(`Failed to fetch details for user ${request.requesterId}:`, err);
                }
            }

            setRequesterDetails(detailsMap);
            setLoadingDetails(false);
        };

        fetchRequesterDetails();
    }, [requests]);

    const handleRespond = async (friendshipId: string, accept: boolean) => {
        setRespondingTo(friendshipId);
        try {
            await respondToRequest(friendshipId, accept);
        } catch (err) {
            console.error('Failed to respond to friend request:', err);
        } finally {
            setRespondingTo(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-gray-600">Loading friend requests...</div>
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

    if (requests.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No pending friend requests</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">
                    Friend Requests ({requests.length})
                </h3>
                <button
                    onClick={refetch}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Refresh
                </button>
            </div>

            {loadingDetails ? (
                <div className="text-center py-4 text-gray-500">Loading request details...</div>
            ) : (
                <div className="space-y-2">
                    {requests.map((request) => {
                        const requester = requesterDetails.get(request.requesterId);
                        const isResponding = respondingTo === request.friendshipId;

                        return (
                            <div
                                key={request.friendshipId}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    {requester?.avatarUrl ? (
                                        <img
                                            src={requester.avatarUrl}
                                            alt={requester.name || 'User'}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-purple-300 flex items-center justify-center text-white font-semibold">
                                            {requester?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {requester?.name || 'Loading...'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            wants to be friends
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRespond(request.friendshipId, true)}
                                        disabled={isResponding}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isResponding ? 'Processing...' : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() => handleRespond(request.friendshipId, false)}
                                        disabled={isResponding}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isResponding ? 'Processing...' : 'Decline'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

