import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

type GameDifficulty = {
  level: string;
  gameId: number;
  assetBundleUrl: string | null;
  hasPieces: boolean;
  gridSize: number;
};

type Game = {
  name: string;
  description: string | null;
  difficulties: GameDifficulty[];
};

export default function UploadPicture() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameName, setSelectedGameName] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [gameId, setGameId] = useState<string>("");
  const [maxUnlocks, setMaxUnlocks] = useState<string>("0");
  const [expiresInDays, setExpiresInDays] = useState<string>("7");
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const result = await api.getActiveGames();
        console.log('Fetched games:', result);
        setGames(result.games);
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError('Failed to load games. Please refresh the page.');
      }
    };
    fetchGames();
  }, []);

  // When game name changes, reset difficulty and gameId
  useEffect(() => {
    if (selectedGameName) {
      const game = games.find(g => g.name === selectedGameName);
      if (game && game.difficulties.length > 0) {
        // Auto-select first difficulty
        const firstDifficulty = game.difficulties[0];
        setSelectedDifficulty(firstDifficulty.level);
        setGameId(String(firstDifficulty.gameId));
      }
    } else {
      setSelectedDifficulty("");
      setGameId("");
    }
  }, [selectedGameName, games]);

  // When difficulty changes, update gameId
  useEffect(() => {
    if (selectedGameName && selectedDifficulty) {
      const game = games.find(g => g.name === selectedGameName);
      const difficulty = game?.difficulties.find(d => d.level === selectedDifficulty);
      if (difficulty) {
        setGameId(String(difficulty.gameId));
      }
    }
  }, [selectedDifficulty, selectedGameName, games]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("picture", file);
      formData.append("requiredGameId", gameId);
      formData.append("maxUnlocks", maxUnlocks);
      formData.append("expiresInDays", expiresInDays);

      const result = await api.uploadPicture(formData);
      setShareLink(result.shareLink);
    } catch (err: any) {
      setError(err.message || "Failed to upload picture");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  if (shareLink) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-between p-8 pt-20 pb-12">
        {/* Success Message */}
        <div className="text-center text-white space-y-3 max-w-sm">
          <div className="flex justify-center mb-4">
            <svg
              className="h-16 w-16 text-actionButton"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold">Picture Uploaded!</h2>
          <p className="text-base">Share this link with someone special</p>
          <p className="text-sm opacity-90">They'll need to play the game to unlock it</p>
        </div>

        {/* Envelope Visual */}
        <div className="flex-1 flex items-center justify-center my-8">
          <div className="relative transform hover:scale-105 transition-transform">
            {/* Envelope */}
            <div className="w-72 h-52 bg-white rounded-3xl shadow-2xl relative overflow-hidden">
              {/* Envelope flap */}
              <div className="absolute top-0 left-0 right-0 h-28 bg-tertiary rounded-t-3xl"></div>
              
              {/* Share icon badge */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-actionButton rounded-full flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Share Link */}
        <div className="w-full max-w-md space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <label className="block text-sm font-medium text-white mb-2 opacity-90">
              Your Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 px-4 py-3 bg-white rounded-xl border-none outline-none text-secondary text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-6 py-3 bg-actionButton text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShareLink("");
                setFile(null);
                setPreview("");
                setTitle("");
                setDescription("");
                setSelectedGameName("");
                setSelectedDifficulty("");
                setGameId("");
              }}
              className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors font-medium"
            >
              Upload Another
            </button>
            <button
              onClick={() => navigate("/home")}
              className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <header className="bg-background px-4 py-3 pt-14 flex items-center border-b border-primary">
          <button onClick={() => navigate("/home")} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-xl font-medium text-secondary pr-10">Create</h1>
        </header>

        {/* Form */}
        <form onSubmit={handleUpload} className="p-6 space-y-6">
          {/* Image Preview/Upload Area */}
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-48 h-64 bg-tertiary rounded-3xl overflow-hidden flex items-center justify-center border-2 border-dashed border-primary/30">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <svg className="w-12 h-12 mx-auto text-secondary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-secondary/60">Tap to upload or take photo</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-2xl border-none outline-none text-secondary placeholder-secondary/40"
              placeholder="Enter title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white rounded-2xl border-none outline-none text-secondary placeholder-secondary/40 resize-none"
              placeholder="Enter description..."
            />
          </div>

          <div className="border-t border-primary pt-6"></div>

          {/* Select Game */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Select game</label>
            {games.length === 0 ? (
              <div className="w-full px-4 py-3 bg-white rounded-2xl text-center text-secondary/40">
                Loading games...
              </div>
            ) : (
              <select
                value={selectedGameName}
                onChange={(e) => setSelectedGameName(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-2xl border-none outline-none text-secondary appearance-none cursor-pointer text-center"
              >
                <option value="">Choose a game</option>
                {games.map((game) => (
                  <option key={game.name} value={game.name}>
                    {game.name.charAt(0).toUpperCase() + game.name.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              disabled={!selectedGameName}
              className="w-full px-4 py-3 bg-white rounded-2xl border-none outline-none text-secondary appearance-none cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Choose difficulty</option>
              {selectedGameName && games.find(g => g.name === selectedGameName)?.difficulties.map((diff) => (
                <option key={diff.level} value={diff.level}>
                  {diff.level.charAt(0) + diff.level.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-primary pt-6"></div>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-3 bg-actionButton text-textActionButton rounded-3xl font-medium "
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-center min-h-screen p-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full">
          <div className="flex items-center mb-6">
            <button onClick={() => navigate("/home")} className="p-2 -ml-2">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="flex-1 text-center text-2xl font-semibold text-secondary pr-10">Create Post</h1>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Image Upload */}
              <div>
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="aspect-[3/4] bg-tertiary rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-primary/30">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <svg className="w-16 h-16 mx-auto text-secondary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="mt-2 text-sm text-secondary/60">Click to upload</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-tertiary rounded-xl border-none outline-none text-secondary"
                    placeholder="Enter title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-tertiary rounded-xl border-none outline-none text-secondary resize-none"
                    placeholder="Enter description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Game</label>
                  {games.length === 0 ? (
                    <div className="w-full px-4 py-2 bg-tertiary rounded-xl text-secondary/40">
                      Loading games...
                    </div>
                  ) : (
                    <select
                      value={selectedGameName}
                      onChange={(e) => setSelectedGameName(e.target.value)}
                      className="w-full px-4 py-2 bg-tertiary rounded-xl border-none outline-none text-secondary"
                    >
                      <option value="">Choose game</option>
                      {games.map((game) => (
                        <option key={game.name} value={game.name}>
                          {game.name.charAt(0).toUpperCase() + game.name.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    disabled={!selectedGameName}
                    className="w-full px-4 py-2 bg-tertiary rounded-xl border-none outline-none text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose difficulty</option>
                    {selectedGameName && games.find(g => g.name === selectedGameName)?.difficulties.map((diff) => (
                      <option key={diff.level} value={diff.level}>
                        {diff.level.charAt(0) + diff.level.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full py-3 bg-actionButton text-textActionButton rounded-xl font-medium hover:opacity-90 transition-opacity disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
