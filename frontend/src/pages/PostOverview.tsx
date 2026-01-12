import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";

interface Comment {
  id: string;
  userName: string;
  text: string;
}

interface Post {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  comments: Comment[];
}

export default function PostOverview() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { data: session, isPending } = authClient.useSession();
  const [comment, setComment] = useState("");
  
  // Mock post data - replace with API call
  const [post] = useState<Post>({
    id: postId || "1",
    title: "Couch reveal",
    imageUrl: "https://via.placeholder.com/400x600/AF8159/FFFFFF?text=Post+Image",
    description: "I've bought this new chair! I've finally completed my vision for my living room and im so happy to finally show it to you!",
    comments: [
      { id: "1", userName: "Auntie May", text: "Finally! I'm so happy for you!" },
      { id: "2", userName: "Friend Sarah", text: "You've been working so hard to get this. Good job!" },
      { id: "3", userName: "Friend Brian", text: "Can't wait to come and see it in person!" },
    ]
  });

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/signin");
    }
  }, [session, isPending, navigate]);

  const handleSendComment = () => {
    if (comment.trim()) {
      // TODO: Send comment to backend
      console.log("Sending comment:", comment);
      setComment("");
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
    <div className="min-h-screen bg-background pb-24">
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
        {/* Post Title */}
        <h2 className="text-2xl font-medium text-secondary text-center">{post.title}</h2>

        {/* Post Image */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-card">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full aspect-[3/4] object-cover"
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-primary">Description</h3>
          <p className="text-base text-secondary leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-primary">Comments</h3>
          
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="pb-3 border-b border-primary/20">
                <p className="font-semibold text-secondary text-sm mb-1">{comment.userName}</p>
                <p className="text-secondary text-sm">{comment.text}</p>
              </div>
            ))}
          </div>

          {/* Comment Input */}
          <div className="space-y-3 pt-4">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write comment"
              className="w-full px-4 py-3 bg-white rounded-full border-none text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleSendComment}
              className="w-full py-3 bg-actionButton text-white rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Sent
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
  );
}

