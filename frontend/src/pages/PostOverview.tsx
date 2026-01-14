import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { api } from "../lib/api";
import BlobsImage from "../assets/app_assets/blobs2.png";

interface Comment {
  commentId: string;
  commenterId: string;
  content: string;
  createdAt: string;
  username: string | null;
}

interface Picture {
  pictureId: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}

export default function PostOverview() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { data: session, isPending } = authClient.useSession();
  const [comment, setComment] = useState("");
  const [imageZoomed, setImageZoomed] = useState(false);
  const [picture, setPicture] = useState<Picture | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/signin");
    }
  }, [session, isPending, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const [pictureData, commentsData] = await Promise.all([
          api.getPictureById(postId),
          api.getComments(postId)
        ]);
        setPicture(pictureData);
        setComments(commentsData.comments || []);
      } catch (err: any) {
        console.error("Failed to load data:", err);
        setError(err.message || "Failed to load picture");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadData();
    }
  }, [postId, session]);

  const handleSendComment = async () => {
    if (!comment.trim() || !postId) return;

    try {
      setSubmittingComment(true);
      const data = await api.addComment(postId, comment);
      setComments([data.comment, ...comments]);
      setComment("");
    } catch (err: any) {
      console.error("Failed to add comment:", err);
      setError(err.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-secondary">Loading...</div>
      </div>
    );
  }

  if (!session || !picture) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate("/home")} className="text-primary underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden pb-24">
        {/* Header */}
        <header className="bg-background px-4 py-3 pt-12 flex items-center justify-between sticky top-0 z-10 border-b border-gray-200">
          <button onClick={() => navigate(-1)} className="p-2">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-secondary">Overview</h1>
          <button className="p-2">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        {/* Content */}
        <main className="px-4 py-6 space-y-6">
          {/* Sender Name */}
          <h2 className="text-2xl font-medium text-secondary text-center">Picture from {picture.sender.name}</h2>

          {/* Post Image */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-card">
              <img 
                src={picture.mediaUrl} 
                alt="Picture"
                className="w-full aspect-[3/4] object-cover"
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-primary">Comments</h3>
            
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-secondary/60 text-center py-4">No comments yet</p>
              ) : (
                comments.map((commentItem) => (
                  <div key={commentItem.commentId} className="pb-3 border-b border-primary/20">
                    <p className="font-semibold text-secondary text-sm mb-1">{commentItem.username || "Anonymous"}</p>
                    <p className="text-secondary text-sm">{commentItem.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="space-y-3 pt-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write comment"
                rows={4}
                className="w-full px-4 py-3 bg-white rounded-2xl border-none text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <button
                onClick={handleSendComment}
                disabled={!comment.trim() || submittingComment}
                className="w-full py-3 bg-actionButton text-white rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-primary text-white flex items-center justify-around py-4 px-6 shadow-2xl z-50">
          <button onClick={() => navigate("/home")} className="p-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>
          <button onClick={() => navigate("/upload")} className="p-2">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button onClick={() => navigate("/profile")} className="p-2">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
        </nav>
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

        {/* Center Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Background Layer - Prevents Content from Scrolling Under Title */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-tertiary z-20"></div>
          
          {/* Big Header at Top - Absolute Positioned Over Sidebar */}
          <h1 className="absolute top-12 left-64 text-7xl font-medium text-secondary z-30">Your dashboard</h1>
          
          {/* Scrollable Content */}
          <main className="flex-1 bg-tertiary overflow-y-auto scrollbar-hide pt-48">
            <div className="max-w-xl mx-auto px-8">
              <h2 className="text-lg font-medium text-secondary pb-2 mb-6 border-b border-secondary/40">Post overview</h2>
                
              {/* Picture at Top */}
              <div 
                className="bg-white rounded-2xl overflow-hidden shadow-lg mb-6 max-w-[280px] mx-auto cursor-pointer relative group"
                onClick={() => setImageZoomed(true)}
              >
                <img 
                  src={picture.mediaUrl} 
                  alt="Picture"
                  className="w-full aspect-[3/4] object-cover"
                />
                {/* Zoom Icon Overlay */}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
                {/* Sender Info */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">From</label>
                  <div className="px-4 py-3 bg-tertiary rounded-2xl text-secondary">
                    {picture.sender.name}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">Date</label>
                  <div className="px-4 py-3 bg-tertiary rounded-2xl text-secondary">
                    {new Date(picture.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Right Sidebar - Comments Section */}
        <aside className="w-80 bg-tertiary px-6 pt-48 pb-8 mr-32">
          <div className="mt-20">
            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col max-h-[calc(100vh-20rem)]">
              <h3 className="text-lg font-medium text-secondary mb-6 pb-2 border-b border-secondary/40">Comments</h3>
              
              {/* Existing Comments - Scrollable */}
              <div className="space-y-3 overflow-y-auto mb-6 flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {comments.length === 0 ? (
                  <p className="text-secondary/60 text-center py-4">No comments yet</p>
                ) : (
                  comments.map((commentItem) => (
                    <div key={commentItem.commentId} className="pb-3 border-b border-secondary/10">
                      <p className="font-semibold text-secondary text-sm mb-1">{commentItem.username || "Anonymous"}</p>
                      <p className="text-secondary text-sm">{commentItem.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input - Fixed at Bottom */}
              <div className="space-y-3 pt-4 border-t border-secondary/20">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write comment"
                  rows={4}
                  className="w-full px-4 py-3 bg-tertiary rounded-xl text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!comment.trim() || submittingComment}
                  className="w-full py-3 bg-actionButton text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Image Zoom Modal */}
        {imageZoomed && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8"
            onClick={() => setImageZoomed(false)}
          >
            <button
              onClick={() => setImageZoomed(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="max-w-4xl max-h-full">
              <img 
                src={picture.mediaUrl} 
                alt="Picture"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

