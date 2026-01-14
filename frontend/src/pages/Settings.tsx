import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import BlobsImage from "../assets/app_assets/blobs2.png";

export default function Settings() {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="text-secondary px-4 py-3 pt-14 flex flex-col">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl text-secondary font-medium">Settings</h1>
            <div className="w-8"></div>
          </div>
          <div className="border-t border-primary w-full mt-3"></div>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 px-4 py-6 space-y-6">
          {/* User Details Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="text-xl font-medium text-secondary mb-4">Account Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
              <div className="text-base text-secondary bg-tertiary rounded-lg px-4 py-3">
                {session.user.name || "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="text-base text-secondary bg-tertiary rounded-lg px-4 py-3">
                {session.user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
              <div className="text-xs text-secondary bg-tertiary rounded-lg px-4 py-3 font-mono">
                {session.user.id}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 text-white rounded-2xl py-4 font-medium hover:bg-red-600 transition-colors shadow-card"
          >
            Log Out
          </button>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-tertiary relative">
        {/* Decorative Blobs - Bottom Left Corner */}
        <img 
          src={BlobsImage} 
          alt="" 
          className="fixed bottom-2 left-0 w-86 h-auto pointer-events-none z-20 opacity-90"
        />
        
        {/* Left Sidebar */}
        <aside className="w-96 bg-tertiary p-8 pl-32 pt-36 ml-32 flex flex-col relative">
          <div className="relative z-10 space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-md mt-26 space-y-2">
              <button
                onClick={() => navigate("/home")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-tertiary transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <span className="text-sm text-secondary">Dashboard</span>
              </button>
              
              <button
                onClick={() => navigate("/settings")}
                className="w-full text-left px-3 py-2 rounded-lg bg-tertiary transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
                <span className="text-sm text-secondary">Settings</span>
              </button>
            </div>

            <button
              onClick={() => navigate("/upload")}
              className="w-full px-4 py-3 rounded-xl bg-actionButton text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
            >
              Create post
            </button>
          </div>
        </aside>

        {/* Center Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Background Layer */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-tertiary z-20"></div>
          
          {/* Big Header at Top */}
          <h1 className="absolute top-12 left-64 text-7xl font-medium text-secondary z-30">Settings</h1>
          
          <main className="flex-1 bg-tertiary overflow-y-auto scrollbar-hide pt-48">
            <div className="max-w-2xl mx-auto px-8 pb-12">
              {/* Account Details Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-secondary pb-2 mb-6 border-b border-secondary/40">
                  Account Details
                </h2>
                
                <div className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Name</label>
                    <div className="text-lg text-secondary bg-tertiary rounded-lg px-4 py-3">
                      {session.user.name || "Not set"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
                    <div className="text-lg text-secondary bg-tertiary rounded-lg px-4 py-3">
                      {session.user.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">User ID</label>
                    <div className="text-sm text-secondary bg-tertiary rounded-lg px-4 py-3 font-mono">
                      {session.user.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <h2 className="text-lg font-medium text-secondary pb-2 mb-6 border-b border-secondary/40">
                  Actions
                </h2>
                
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 text-white rounded-xl px-8 py-3 font-medium hover:bg-red-600 transition-colors shadow-md"
                >
                  Log Out
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* Right Sidebar - Empty for consistency */}
        <aside className="w-80 bg-tertiary mr-32"></aside>
      </div>
    </div>
  );
}

