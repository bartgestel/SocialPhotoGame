import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import pBlobCut from "../assets/app_assets/p_blob_cut.svg";
import gBlobCut from "../assets/app_assets/g_blob_cut.svg";
import HomeD from "../assets/app_assets/svg/Home_d.svg";
import HomeL from "../assets/app_assets/svg/Home_L.svg";
import PhotoL from "../assets/app_assets/svg/photo_L.svg";
import ProfileD from "../assets/app_assets/svg/profile_D.svg";
import ProfileL from "../assets/app_assets/svg/profile_L.svg";

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
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <header className="text-secondary px-4 py-3 pt-14 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="w-8"></div>
            <h1 className="text-2xl text-secondary font-medium">What's new</h1>
            <div className="w-8"></div>
          </div>
          <div className="border-t border-primary  w-full"></div>
        </header>
        

          {/* Mobile Content - Scrollable Feed */}
          <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 space-y-4">
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
               <span className="text-base font-medium z-10 self-end -mb-2">New Photo Filters</span>
              <div className="absolute -right-3 -top-5">
                <img src={pBlobCut} alt="New Photo Filters" className="w-36 h-36" />
              </div>
             </div>

          {/* New Games Available Card */}
            <div className="bg-actionButton text-white rounded-2xl p-6 flex items-center justify-between min-h-[100px] relative overflow-hidden shadow-card">
            <span className="text-base font-medium z-10 self-end -mb-2">New Games Available</span>
            <div className="absolute -right-3 -top-5">
              <img src={gBlobCut} alt="New Games Available" className="w-36 h-36" />
            </div>
          </div>

          <div className="border-t border-primary  w-full mt-10 mb-10"></div>

          {/* No New Comments Card */}
          <div className="bg-[#808080] text-white rounded-2xl p-2 text-center shadow-card">
            <span className="text-base">No new comments</span>
          </div>

          {/* Notifications */}
          <div className="bg-primary text-white rounded-2xl p-2 shadow-card">
            <span className="text-sm">"New chair" has been revealed 20 times</span>
          </div>

          <div className="bg-primary text-white rounded-2xl p-2 shadow-card">
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
            className={`p-2 ${activeTab === "home" }`}
          >
            <img 
              src={activeTab === "home" ? HomeD : HomeL} 
              alt="Home" 
              className="w-8 h-8" 
            />
          </button>
          <button
            onClick={() => {
              setActiveTab("add");
              navigate("/upload");
            }}
            className="p-2"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={PhotoL} 
                alt="Add Photo" 
                className="w-10 h-10" 
              />
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab("profile");
              navigate("/profile");
            }}
            className={`p-2 ${activeTab === "profile" }`}
          >
            <img 
              src={activeTab === "profile" ? ProfileD : ProfileL} 
              alt="Profile" 
              className="w-10 h-10" 
            />
          </button>
        </nav>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-tertiary">
        {/* Left Sidebar */}
        <aside className="w-96 bg-tertiary p-8 pl-32 pt-36 ml-32 flex flex-col relative">
          {/* Decorative Circles - Bottom Left */}
          <div className="absolute left-0 bottom-20 w-48 h-48 bg-secondary rounded-full -translate-x-1/2"></div>
          <div className="absolute left-12 bottom-40 w-28 h-28 bg-primary rounded-full"></div>
          <div className="absolute left-6 top-40 w-20 h-20 bg-primary/70 rounded-full"></div>
          <div className="absolute left-16 top-56 w-12 h-12 bg-secondary/60 rounded-full"></div>

          {/* Sidebar Content */}
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
                onClick={() => handleSignOut()}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-tertiary transition-colors flex items-center gap-3"
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
          {/* Big Header at Top - Absolute Positioned Over Sidebar */}
          <h1 className="absolute top-12 left-64 text-7xl text-secondary z-30">Your dashboard</h1>
          
          <main className="flex-1 bg-tertiary overflow-y-auto scrollbar-hide pt-48">
            <div className="max-w-xl mx-auto px-8">
            {/* Tab Navigation */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-secondary pb-2 border-b border-secondary/40">Recent posts</h2>
            </div>
            
            {/* Post Card */}
            <div className="bg-tertiary rounded-3xl overflow-hidden shadow-lg">
              <div className="aspect-[3/4] bg-gradient-to-b from-tertiary to-white flex items-center justify-center">
                <svg className="w-20 h-20 text-secondary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mt-4">
              <button className="p-3 hover:bg-white/50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button className="p-3 hover:bg-white/50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button className="p-3 hover:bg-white/50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
          </main>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 bg-tertiary overflow-y-auto px-6 pt-48 pb-8 mr-32 space-y-6 scrollbar-hide">
          {/* What's New Section */}
          <div>
            <h2 className="text-lg font-medium text-secondary pb-2 mb-6 border-b border-secondary/40">What's new</h2>
            <div className="space-y-3">
              <div className="bg-[#5C4890] text-white rounded-2xl px-4 py-6 text-sm font-medium shadow-card">
                New Photo Filters
              </div>
              <div className="bg-actionButton text-white rounded-2xl px-4 py-6 text-sm font-medium shadow-card">
                New Games Available
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h2 className="text-lg font-medium text-secondary pb-2 mb-6 border-b border-secondary/40">Notifications</h2>
            <div className="space-y-3">
              <div className="bg-[#808080] text-white rounded-2xl px-4 py-4 text-center text-sm shadow-card">
                No new comments
              </div>
              <div className="bg-primary text-white rounded-2xl px-4 py-4 text-sm shadow-card">
                "New chair" has been revealed 20 times
              </div>
              <div className="bg-primary text-white rounded-2xl px-4 py-4 text-sm shadow-card">
                "Gender reveal" has been revealed 45 times
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
