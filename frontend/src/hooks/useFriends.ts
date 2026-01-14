import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface Friend {
    friendshipId: string;
    requesterId: string;
    addresseeId: string;
    status: string;
}

interface UseFriendsReturn {
    friends: Friend[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useFriends = (): UseFriendsReturn => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFriends = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await api.getFriends();
            setFriends(data.friends || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setFriends([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    return { friends, loading, error, refetch: fetchFriends };
};

