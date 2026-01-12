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
import BlobsImage from "../assets/app_assets/blobs2.png";

export default function Home() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">("home");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/signin");
    }
  }, [session, isPending, navigate]);

  const handleShareClick = (postId: number) => {
    setSelectedPostId(postId);
    setShareModalOpen(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    const shareLink = `${window.location.origin}/post/${selectedPostId}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    const shareLink = `${window.location.origin}/post/${selectedPostId}`;
    const shareText = "Check out my post!";
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
      instagram: shareLink, // Instagram doesn't support direct sharing
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`
    };

    if (platform === 'instagram') {
      handleCopyLink();
      alert("Instagram doesn't support direct sharing. Link copied to clipboard!");
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
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
      <div className="hidden lg:flex h-screen overflow-hidden bg-tertiary relative">
        {/* Decorative Blobs - Bottom Left Corner (Fixed) */}
        <img 
          src={BlobsImage} 
          alt="" 
          className="fixed bottom-2 left-0 w-86 h-auto pointer-events-none z-20 opacity-90"
        />
        
        {/* Left Sidebar */}
        <aside className="w-96 bg-tertiary p-8 pl-32 pt-36 ml-32 flex flex-col relative">
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
                onClick={() => navigate("/settings")}
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
          {/* Header Background Layer - Prevents Content from Scrolling Under Title */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-tertiary z-20"></div>
          
          {/* Big Header at Top - Absolute Positioned Over Sidebar */}
          <h1 className="absolute top-12 left-64 text-7xl font-medium text-secondary z-30">Your dashboard</h1>
          
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
            <div className="flex gap-4 justify-center mt-4 mb-8">
              <button onClick={() => navigate("/edit/1")} className="p-3 hover:bg-white/50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button onClick={() => navigate("/overview/1")} className="p-3 hover:bg-white/50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button onClick={() => handleShareClick(1)} className="p-3 hover:bg-white/50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>

            {/* Second Post Card */}
            <div className="bg-tertiary rounded-3xl overflow-hidden shadow-lg">
              <div className="aspect-[3/4] bg-gradient-to-b from-tertiary to-white flex items-center justify-center">
                <svg className="w-20 h-20 text-secondary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Action Buttons for Second Post */}
            <div className="flex gap-4 justify-center mt-4">
              <button onClick={() => navigate("/edit/2")} className="p-3 hover:bg-white/50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button onClick={() => navigate("/overview/2")} className="p-3 hover:bg-white/50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button onClick={() => handleShareClick(2)} className="p-3 hover:bg-white/50 rounded-full transition-colors">
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

        {/* Share Modal */}
        {shareModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-tertiary rounded-3xl p-8 w-full max-w-sm relative">
              {/* Modal Content */}
              <div className="text-center">
                <h2 className="text-xl font-medium text-secondary mb-6">Share on socials</h2>

                {/* Social Icons */}
                <div className="mb-8">
                  {/* First Row */}
                  <div className="flex justify-center gap-6 mb-4">
                    <button 
                      onClick={() => handleSocialShare('whatsapp')}
                      className="p-3 hover:bg-background rounded-full transition-colors"
                    >
                      <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                    
                    <button 
                      onClick={() => handleSocialShare('facebook')}
                      className="p-3 hover:bg-background rounded-full transition-colors"
                    >
                      <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>

                    <button 
                      onClick={() => handleSocialShare('instagram')}
                      className="p-3 hover:bg-background rounded-full transition-colors"
                    >
                      <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Second Row - Centered */}
                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => handleSocialShare('linkedin')}
                      className="p-3 hover:bg-background rounded-full transition-colors"
                    >
                      <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </button>

                    <button className="p-3 hover:bg-background rounded-full transition-colors">
                      <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Copy Link Section */}
                <div className="mb-6">
                  <p className="text-sm text-secondary mb-3">Copy your custom link</p>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/post/${selectedPostId}`}
                      className="flex-1 bg-transparent text-sm text-secondary outline-none"
                    />
                    <button 
                      onClick={handleCopyLink}
                      className="p-2 hover:bg-tertiary rounded-lg transition-colors"
                    >
                      {copied ? (
                        <svg className="w-5 h-5 text-actionButton" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="px-8 py-2 bg-white rounded-full text-secondary font-medium hover:bg-background transition-colors shadow-card"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
