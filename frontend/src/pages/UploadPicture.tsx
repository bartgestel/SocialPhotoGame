import { useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function UploadPicture() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [gameId, setGameId] = useState<string>("1");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Upload Picture
        </h1>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Picture
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Game Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Game
            </label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Robbie</option>
              <option value="2">Pipe Connect</option>
              <option value="3">Quick Math</option>
            </select>
          </div>

          {/* Max Unlocks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Unlocks (0 = unlimited)
            </label>
            <input
              type="number"
              min="0"
              value={maxUnlocks}
              onChange={(e) => setMaxUnlocks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires In (days)
            </label>
            <input
              type="number"
              min="1"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
