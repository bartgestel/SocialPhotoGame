import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import UserSearch from "../components/UserSearch";
import FriendsList from "../components/FriendsList";
import FriendRequests from "../components/FriendRequests";
import pBlobCut from "../assets/app_assets/p_blob_cut.svg";
import gBlobCut from "../assets/app_assets/g_blob_cut.svg";

export default function Home() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">("home");

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
    <div className="min-h-screen bg-tertiary">
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <header className="text-secondary px-4 py-3 pt-14 flex items-center justify-between">
          <div className="w-8"></div>
          <h1 className="text-3xl text-secondary font-medium">What's new</h1>
          <div className="w-8"></div>
        </header>
        

          {/* Mobile Content - Scrollable Feed */}
          <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 space-y-4">
           
         <div className="border-t border-primary -mt-6 mb-10 w-full"></div>
          {/* New Photo Filters Card */}
          {/* <div className="bg-purple-600 text-white rounded-2xl p-6 flex items-center justify-between min-h-[100px] relative overflow-hidden">
            <span className="text-lg font-medium z-10">New Photo Filters</span>
            <div className="absolute right-4 top-4">
              <div className="w-16 h-16 bg-white/20 rounded-full"></div>
              <div className="absolute top-8 right-8 w-12 h-12 bg-purple-400/40 rounded-full"></div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/30 rounded-full"></div>
            </div>
          </div> */}
              <div className="bg-[#5C4890] text-white rounded-2xl p-6 flex items-center justify-between min-h-[100px] relative overflow-hidden shadow-card">
               <span className="text-lg font-medium z-10 self-end -mb-2">New Photo Filters</span>
              <div className="absolute -right-3 -top-5">
                <img src={pBlobCut} alt="New Photo Filters" className="w-36 h-36" />
              </div>
             </div>

          {/* New Games Available Card */}
            <div className="bg-actionButton text-white rounded-2xl p-6 flex items-center justify-between min-h-[100px] relative overflow-hidden shadow-card">
            <span className="text-lg font-medium z-10 self-end -mb-2">New Games Available</span>
            <div className="absolute -right-3 -top-5">
              <img src={gBlobCut} alt="New Games Available" className="w-36 h-36" />
            </div>
          </div>

          <div className="border-t border-primary  w-full mt-10 mb-10"></div>

          {/* No New Comments Card */}
          <div className="bg-gray-400 text-white rounded-2xl p-5 text-center">
            <span className="text-base">No new comments</span>
          </div>

          {/* Notifications */}
          <div className="bg-primary/80 text-white rounded-2xl p-4">
            <span className="text-sm">"New chair" has been revealed 20 times</span>
          </div>

          <div className="bg-primary text-white rounded-2xl p-4">
            <span className="text-sm">"Gender reveal" has been revealed 45 times</span>
          </div>

          {/* Friend Requests - Mobile */}
          {/* <div className="bg-purple-500 text-white rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-2">Friend Requests</h3>
            <FriendRequests />
          </div> */}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-primary text-white flex items-center justify-around py-4 px-6 shadow-2xl drop-shadow-2xl">
          <button
            onClick={() => setActiveTab("home")}
            className={`p-2 ${activeTab === "home" ? "bg-secondary text-white rounded-full" : "bg-transparent"}`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>
          <button
            onClick={() => {
              setActiveTab("add");
              navigate("/upload");
            }}
            className="p-2"
          >
            <div className="w-12 h-12 rounded-full border-3 border-white flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-2 ${activeTab === "profile" ? "opacity-100": "bg-transparent"}`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-tertiary p-6 flex flex-col relative">
          {/* Decorative Circles */}
          <div className="absolute left-8 top-32 w-24 h-24 bg-primary rounded-full"></div>
          <div className="absolute left-12 top-56 w-16 h-16 bg-primary/60 rounded-full"></div>
          <div className="absolute left-4 bottom-32 w-32 h-32 bg-secondary rounded-full"></div>
          <div className="absolute left-16 bottom-24 w-20 h-20 bg-primary/70 rounded-full"></div>

          {/* Sidebar Content */}
          <div className="relative z-10 space-y-4">
            <button
              onClick={() => navigate("/")}
              className="w-full text-left px-4 py-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span className="font-medium text-secondary">Dashboard</span>
            </button>
            
            <button
              onClick={() => handleSignOut()}
              className="w-full text-left px-4 py-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              <span className="font-medium text-secondary">Settings</span>
            </button>

            <button
              onClick={() => navigate("/upload")}
              className="w-full mt-6 px-4 py-3 rounded-lg bg-actionButton text-white font-medium hover:opacity-90 transition-opacity"
            >
              Create post
            </button>
          </div>
        </aside>

        {/* Center Content */}
        <main className="flex-1 bg-tertiary overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-4xl font-bold text-secondary mb-8">Your dashboard</h1>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-secondary mb-6">Recent posts</h2>
              
              {/* Sample Post Card */}
              <div className="bg-tertiary rounded-xl overflow-hidden">
                <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="p-4 flex gap-4 justify-center">
                  <button className="p-2 hover:bg-white/50 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-white/50 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-white/50 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Friend Search */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-secondary mb-4">Find Friends</h3>
                <UserSearch currentUserId={session.user.id} />
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-tertiary overflow-y-auto p-6 space-y-6">
          {/* What's New Section */}
          <div>
            <h2 className="text-xl font-semibold text-secondary mb-4">What's new</h2>
            <div className="space-y-3">
              <div className="bg-purple-600 text-white rounded-xl p-4 text-sm font-medium">
                New Photo Filters
              </div>
              <div className="bg-actionButton text-white rounded-xl p-4 text-sm font-medium">
                New Games Available
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h2 className="text-xl font-semibold text-secondary mb-4">Notifications</h2>
            <div className="space-y-2">
              <div className="bg-gray-400 text-white rounded-xl p-3 text-center text-sm">
                No new comments
              </div>
              <div className="bg-primary/80 text-white rounded-xl p-3 text-xs">
                "New chair" has been revealed 20 times
              </div>
              <div className="bg-primary text-white rounded-xl p-3 text-xs">
                "Gender reveal" has been revealed 45 times
              </div>
            </div>
          </div>

          {/* Friend Requests */}
          <div>
            <h2 className="text-xl font-semibold text-secondary mb-4">Friend Requests</h2>
            <FriendRequests />
          </div>

          {/* Friends List */}
          <div>
            <h2 className="text-xl font-semibold text-secondary mb-4">My Friends</h2>
            <FriendsList currentUserId={session.user.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}
