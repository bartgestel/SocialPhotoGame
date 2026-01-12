import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";

interface Post {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  gameId: string;
  difficulty: string;
}

export default function PostEdit() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { data: session, isPending } = authClient.useSession();
  
  // Mock post data - replace with API call
  const [post, setPost] = useState<Post>({
    id: postId || "1",
    title: "Couch reveal",
    imageUrl: "https://via.placeholder.com/400x600/AF8159/FFFFFF?text=Post+Image",
    description: "I've bought this new chair! I've finally completed my vision for my living room and im so happy to finally show it to you!",
    gameId: "1",
    difficulty: "hard"
  });

  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [difficulty, setDifficulty] = useState(post.difficulty);

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/signin");
    }
  }, [session, isPending, navigate]);

  const handleSave = async () => {
    // TODO: Save changes to backend
    console.log("Saving post:", { title, description, difficulty });
    // Navigate back after saving
    navigate(-1);
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
      <header className="bg-background px-4 py-3 pt-12 flex items-center sticky top-0 z-10 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2">
          <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-xl font-medium text-secondary pr-10">Edit</h1>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Post Image */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs bg-white rounded-3xl overflow-hidden shadow-card">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full aspect-[3/4] object-cover"
            />
          </div>
        </div>

        <div className="border-t border-primary/20 pt-6"></div>

        {/* Title Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-2xl border-none text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Enter title"
          />
        </div>

        <div className="border-t border-primary/20"></div>

        {/* Description Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-white rounded-2xl border-none text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Enter description"
          />
        </div>

        <div className="border-t border-primary/20"></div>

        {/* Selected Game */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">Selected game</label>
          <button
            onClick={() => {/* TODO: Open game selection modal */}}
            className="w-24 h-24 bg-[#5C4890] rounded-2xl flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity shadow-card"
          >
            Edit
          </button>
        </div>

        {/* Difficulty Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-2xl border-none text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235E3023'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="border-t border-primary/20 pt-6"></div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-actionButton text-white rounded-2xl font-medium hover:opacity-90 transition-opacity shadow-md"
        >
          Save
        </button>
      </main>
    </div>
  );
}

