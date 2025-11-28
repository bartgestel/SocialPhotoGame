import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

interface PictureInfo {
  pictureId: string;
  requiredGameId: number;
  sender: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
  createdAt: string;
  expiresAt: string | null;
  maxUnlocks: number;
  currentUnlocks: number;
}

interface UnlockedPicture {
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

export default function UnlockPicture() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pictureInfo, setPictureInfo] = useState<PictureInfo | null>(null);
  const [unlockedPicture] = useState<UnlockedPicture | null>(null);
  const [anonymousId, setAnonymousId] = useState<string>("");

  useEffect(() => {
    // Get or create anonymous ID from localStorage
    let storedId = localStorage.getItem("anonymousId");
    if (!storedId) {
      // Generate UUID fallback for non-secure contexts (HTTP)
      storedId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      localStorage.setItem("anonymousId", storedId);
    }
    setAnonymousId(storedId);

    loadPictureInfo();
  }, [shareToken]);

  const loadPictureInfo = async () => {
    if (!shareToken) return;

    try {
      setLoading(true);
      setError("");
      const data = await api.getPictureByToken(shareToken);
      setPictureInfo(data);
    } catch (err: any) {
      setError(err.message || "Failed to load picture");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = () => {
    if (!pictureInfo || !shareToken) return;
    // Navigate to game page with shareToken
    navigate(`/game?shareToken=${shareToken}&anonymousId=${anonymousId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading picture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (unlockedPicture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Picture Unlocked! 🎉
            </h2>
            <p className="mt-2 text-gray-600">
              From {unlockedPicture.sender.name}
              {unlockedPicture.sender.username &&
                ` (@${unlockedPicture.sender.username})`}
            </p>
          </div>

          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={unlockedPicture.mediaUrl}
              alt="Unlocked picture"
              className="w-full h-auto"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Shared on{" "}
              {new Date(unlockedPicture.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!pictureInfo) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="h-12 w-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Locked Picture
          </h1>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">From</p>
            <div className="flex items-center justify-center gap-3">
              {pictureInfo.sender.image && (
                <img
                  src={pictureInfo.sender.image}
                  alt={pictureInfo.sender.name}
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  {pictureInfo.sender.name}
                </p>
                {pictureInfo.sender.username && (
                  <p className="text-sm text-gray-500">
                    @{pictureInfo.sender.username}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p>🎮 Play a game to unlock this picture</p>
            {pictureInfo.maxUnlocks > 0 && (
              <p>
                🔓 {pictureInfo.currentUnlocks}/{pictureInfo.maxUnlocks} unlocks
                used
              </p>
            )}
            {pictureInfo.expiresAt && (
              <p>
                ⏰ Expires{" "}
                {new Date(pictureInfo.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <button
            onClick={handlePlayGame}
            className="mt-8 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
          >
            Play Game to Unlock
          </button>

          <p className="mt-4 text-xs text-gray-500">
            No account needed • Free to play
          </p>
        </div>
      </div>
    </div>
  );
}
