import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface FriendRequest {
    friendshipId: string;
    requesterId: string;
    addresseeId: string;
    status: string;
}

interface UseFriendRequestsReturn {
    requests: FriendRequest[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    respondToRequest: (friendshipId: string, accept: boolean) => Promise<void>;
}

export const useFriendRequests = (): UseFriendRequestsReturn => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await api.getFriendRequests();
            setRequests(data.requests || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const respondToRequest = useCallback(async (friendshipId: string, accept: boolean) => {
        setError(null);
        try {
            await api.respondToFriendRequest(friendshipId, accept);
            // Remove the request from the list after responding
            setRequests(prev => prev.filter(req => req.friendshipId !== friendshipId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to respond to request');
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return { requests, loading, error, refetch: fetchRequests, respondToRequest };
};

