import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import envelopeIcon from "../assets/app_assets/envelope.svg";

declare global {
  interface Window {
    handleUnityGameComplete?: (result: any) => void;
  }
}

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
  const [unlockedPicture, setUnlockedPicture] = useState<UnlockedPicture | null>(null);
  const [anonymousId, setAnonymousId] = useState<string>("");
  const [step, setStep] = useState<"landing" | "game" | "revealed">("landing");
  const [gameSessionId, setGameSessionId] = useState<string>("");
  const [unityScene, setUnityScene] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Listen for Unity game completion
  useEffect(() => {
    window.handleUnityGameComplete = async (result: any) => {
      if (result.success && result.pictureUnlocked && result.picture) {
        setUnlockedPicture(result.picture);
        setStep("revealed");
      } else {
        setError("Failed to unlock picture");
      }
    };

    return () => {
      delete window.handleUnityGameComplete;
    };
  }, []);

  // Auto-focus iframe when game loads
  useEffect(() => {
    if (step === "game" && unityScene && iframeRef.current) {
      const timer = setTimeout(() => {
        iframeRef.current?.focus();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, unityScene]);

  const loadPictureInfo = async () => {
    if (!shareToken) return;

    try {
      setLoading(true);
      setError("");
      const data = await api.getPictureByToken(shareToken);
      setPictureInfo(data);
    } catch (err: any) {
      // For development: Show mock data if picture not found
      if (err.message.includes("Picture not found") || err.message.includes("404")) {
        console.warn("Using mock data for development");
        setPictureInfo({
          pictureId: "mock-id",
          requiredGameId: 1,
          sender: {
            id: "mock-sender",
            name: "Test User",
            username: "testuser",
            image: null,
          },
          createdAt: new Date().toISOString(),
          expiresAt: null,
          maxUnlocks: 0,
          currentUnlocks: 0,
        });
      } else {
        setError(err.message || "Failed to load picture");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEnvelope = async () => {
    if (!pictureInfo || !shareToken) return;
    
    try {
      setLoading(true);
      // Start the game session
      const gameData = await api.startGame(
        String(pictureInfo.requiredGameId),
        shareToken,
        anonymousId
      );
      
      setGameSessionId(gameData.sessionId);
      setUnityScene(gameData.unityScene);
      setStep("game");
    } catch (err: any) {
      setError(err.message || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = () => {
    if (!pictureInfo || !shareToken) return;
    // Simulate game completion and unlock picture
    // In production, this would navigate to actual game or embed it
    setLoading(true);
    
    // Simulate game playing and completion
    setTimeout(() => {
      // Mock unlocked picture data - replace with actual API call after game completion
      const mockUnlockedPicture: UnlockedPicture = {
        pictureId: pictureInfo.pictureId,
        mediaUrl: "https://via.placeholder.com/400x600/AF8159/FFFFFF?text=Unlocked+Picture",
        mediaType: "IMAGE",
        createdAt: new Date().toISOString(),
        sender: pictureInfo.sender,
      };
      
      setUnlockedPicture(mockUnlockedPicture);
      setStep("revealed");
      setLoading(false);
    }, 2000); // Simulate 2 second game
  };

  const handleGameComplete = (pictureData: UnlockedPicture) => {
    setUnlockedPicture(pictureData);
    setStep("revealed");
  };

  const handleContinue = () => {
    // Navigate to the post overview page
    navigate(`/overview/${pictureInfo?.pictureId || shareToken}`);
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

  if (!pictureInfo) return null;

  // Step 1: Landing Page with Envelope
  if (step === "landing") {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-between p-8 pt-20 pb-12">
        <div className="text-center text-white space-y-2 max-w-sm">
          <p className="text-lg">Someone wanted to let you know of</p>
          <p className="text-lg">something exciting!</p>
        </div>

        <div className="flex-1 flex items-center justify-center" onClick={handleOpenEnvelope}>
          <div className="relative cursor-pointer transform hover:scale-105 transition-transform">
            {/* Envelope */}
            <div className="w-64 h-48 bg-white rounded-2xl shadow-2xl relative overflow-hidden">
              {/* Envelope flap */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-tertiary transform origin-top"></div>
              
              {/* Open circle badge */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-medium">Open</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-white">
          <p className="text-base">Tap to open</p>
        </div>
      </div>
    );
  }

  // Step 2: Game Playing Page
  if (step === "game") {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-0 md:p-4">
        <div className="w-full h-screen md:w-[95vw] md:h-[90vh] md:max-h-[900px]">
          {/* Unity WebGL Game Container */}
          <div className="relative w-full h-full bg-tertiary md:rounded-3xl overflow-hidden md:shadow-2xl">
            {/* Decorative circles as background (behind Unity) - hidden on mobile */}
            <div className="hidden md:block absolute -left-20 bottom-0 w-48 h-48 bg-secondary rounded-full"></div>
            <div className="hidden md:block absolute -right-12 bottom-12 w-40 h-40 bg-primary rounded-full"></div>
            <div className="hidden md:block absolute -right-16 -top-12 w-64 h-64 bg-secondary/80 rounded-full"></div>
            <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-secondary/70 rounded-full"></div>
            <div className="hidden md:block absolute left-12 top-24 w-16 h-16 bg-primary/60 rounded-full"></div>
            <div className="hidden md:block absolute left-20 bottom-32 w-12 h-12 bg-primary/70 rounded-full"></div>
            
            {/* Unity Game iFrame */}
            {unityScene && (
              <iframe
                ref={iframeRef}
                src={`/unity-game?scene=${encodeURIComponent(unityScene)}&sessionId=${gameSessionId}&gameId=${pictureInfo.requiredGameId}&pictureId=${pictureInfo.pictureId}`}
                className="absolute inset-0 w-full h-full border-none z-10"
                title="Game"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; gamepad; xr-spatial-tracking"
                allowFullScreen
                tabIndex={0}
              />
            )}
            
            {/* Loading state while Unity initializes */}
            {!unityScene && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Loading game...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Revealed Picture Page
  if (step === "revealed" && unlockedPicture) {
    const handleNavigateToComments = () => {
      // Navigate to overview page where they can leave comments
      navigate(`/overview/${pictureInfo?.pictureId || '1'}`);
    };

    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-between p-8 pt-16 pb-8">
        {/* Success Message */}
        <div className="text-center text-white space-y-2 max-w-sm">
          <p className="text-xl font-semibold">Great job!</p>
          <p className="text-base">You've revealed the whole picture</p>
          <p className="text-sm mt-4">
            Tap to leave a comment and let "{unlockedPicture.sender.name}" know what you think!
          </p>
        </div>

        {/* Picture Display - Clickable */}
        <div 
          onClick={handleNavigateToComments}
          className="flex-1 flex items-center justify-center my-8 cursor-pointer"
        >
          <div className="w-full max-w-sm aspect-[3/4] bg-white rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
            <img
              src={unlockedPicture.mediaUrl}
              alt="Revealed picture"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full max-w-sm py-4 bg-secondary text-white rounded-3xl font-medium shadow-lg hover:opacity-90 transition-opacity"
        >
          Continue
        </button>
      </div>
    );
  }

  return null;
}
