import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import UserSearch from "../components/UserSearch";
import FriendsList from "../components/FriendsList";
import FriendRequests from "../components/FriendRequests";

export default function Home() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/signin");
    }
  }, [session, isPending, navigate]);

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate("/signin");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            Social Photo Game
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/upload")}
              className="bg-actionButton text-textActionButton px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              📷 Upload Picture
            </button>
            <span className="text-textPrimary">Welcome, {session.user.name}!</span>
            <button
              onClick={handleSignOut}
              className="bg-secondary text-textActionButton px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
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
          <div className="bg-tertiary rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Find Friends</h2>
            <UserSearch currentUserId={session.user.id} />
          </div>

          {/* Friend Requests Section */}
          <div className="bg-tertiary rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Friend Requests</h2>
            <FriendRequests />
          </div>

          {/* Friends List Section */}
          <div className="bg-tertiary rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">My Friends</h2>
            <FriendsList currentUserId={session.user.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
