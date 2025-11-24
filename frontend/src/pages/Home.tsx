import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import UserSearch from '../components/UserSearch';
import FriendsList from '../components/FriendsList';
import FriendRequests from '../components/FriendRequests';

export default function Home() {
    const navigate = useNavigate();
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (!isPending && !session) {
            navigate('/signin');
        }
    }, [session, isPending, navigate]);

    const handleSignOut = async () => {
        await authClient.signOut();
        navigate('/signin');
    };

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Social Photo Game</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">Welcome, {session.user.name}!</span>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Search Users Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Find Friends</h2>
                        <UserSearch currentUserId={session.user.id} />
                    </div>

                    {/* Friend Requests Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
                        <FriendRequests />
                    </div>

                    {/* Friends List Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">My Friends</h2>
                        <FriendsList currentUserId={session.user.id} />
                    </div>
                </div>
            </main>
        </div>
    );
}

