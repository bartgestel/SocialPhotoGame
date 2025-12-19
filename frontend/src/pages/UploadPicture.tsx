import { useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function UploadPicture() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [gameId, setGameId] = useState<string>("1");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [maxUnlocks, setMaxUnlocks] = useState<string>("0");
  const [expiresInDays, setExpiresInDays] = useState<string>("7");
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [error, setError] = useState<string>("");

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Picture Uploaded!
            </h2>
            <p className="mt-2 text-gray-600">
              Share this link with anyone. They'll need to play the game to
              unlock it.
            </p>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setShareLink("");
                setFile(null);
                setPreview("");
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
            >
              Upload Another
            </button>
            <button
              onClick={() => navigate("/home")}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 font-medium"
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
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-24 h-24 bg-gray-300 rounded-2xl border-none outline-none text-secondary text-center appearance-none cursor-pointer flex items-center justify-center"
            >
              <option value="">Choose</option>
              <option value="1">Robbie</option>
              <option value="2">Pipe Connect</option>
              <option value="3">Quick Math</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-2xl border-none outline-none text-secondary appearance-none cursor-pointer text-center"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
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
                  <select
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="w-full px-4 py-2 bg-tertiary rounded-xl border-none outline-none text-secondary"
                  >
                    <option value="">Choose game</option>
                    <option value="1">Robbie</option>
                    <option value="2">Pipe Connect</option>
                    <option value="3">Quick Math</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 bg-tertiary rounded-xl border-none outline-none text-secondary"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
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
