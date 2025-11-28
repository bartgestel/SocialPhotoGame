import React, { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

// Types
interface GameOption {
  id: string;
  name: string;
}
interface SessionConfig {
  sessionId: string;
  unityScene: string;
  gameId: string;
  anonymousId?: string;
  alreadyUnlocked?: boolean;
  picture?: any;
}
interface UnlockData {
  success: boolean;
  rewardData?: string;
  pictureUnlocked?: boolean;
  picture?: any;
}

const Game: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shareToken = searchParams.get('shareToken');
  const anonymousIdParam = searchParams.get('anonymousId');
  
  // State
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [reward, setReward] = useState<string | null>(null);
  const [unlockedPicture, setUnlockedPicture] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Unity Config
  const {
    unityProvider,
    sendMessage,
    addEventListener,
    removeEventListener,
    isLoaded,
  } = useUnityContext({
    loaderUrl: "game/Build.loader.js",
    dataUrl: "game/Build.data",
    frameworkUrl: "game/Build.framework.js",
    codeUrl: "game/Build.wasm",
  });

  // Auto-start game if shareToken is present
  useEffect(() => {
    if (shareToken && !sessionConfig && !loading) {
      handleSelectGame(null, shareToken, anonymousIdParam || undefined);
    }
  }, [shareToken]);

  // 1. User selects a game -> Get Config from Backend
  const handleSelectGame = async (gameId: string | null, token?: string, anonId?: string) => {
    try {
      setLoading(true);
      const requestData: any = {};
      
      if (token) {
        // Picture unlock mode
        requestData.shareToken = token;
        requestData.anonymousId = anonId;
      } else if (gameId) {
        // Standard game mode
        requestData.gameId = gameId;
      }

      const response = await api.startGame(
        requestData.gameId || '', 
        requestData.shareToken, 
        requestData.anonymousId
      );

      // Check if already unlocked
      if (response.alreadyUnlocked && response.picture) {
        setUnlockedPicture(response.picture);
        return;
      }

      setSessionConfig(response);
      setSelectedGame({ id: gameId || 'unlock', name: "Loading..." });
    } catch (err: any) {
      console.error("Could not start session", err);
      alert(err.message || "Failed to start game");
      if (shareToken) {
        navigate(`/unlock/${shareToken}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Once Unity loads, send the configuration immediately
  useEffect(() => {
    if (isLoaded && sessionConfig) {
      console.log("Unity is loaded:", isLoaded);
      console.log("Sending config to Unity:", sessionConfig);

      // Add a small delay to ensure Unity scene is fully initialized
      setTimeout(() => {
        try {
          const jsonConfig = JSON.stringify(sessionConfig);
          console.log("JSON Config:", jsonConfig);
          sendMessage("GameCoordinator", "InitializeGame", jsonConfig);
        } catch (error) {
          console.error("Error sending message to Unity:", error);
        }
      }, 500);
    }
  }, [isLoaded, sessionConfig, sendMessage]);

  // 3. Listen for Win
  const handleUnlock = useCallback((json: string) => {
    const data: UnlockData = JSON.parse(json);
    if (data.success) {
      if (data.pictureUnlocked && data.picture) {
        setUnlockedPicture(data.picture);
      } else {
        setReward(data.rewardData || "Success!");
      }
    }
  }, []);

  useEffect(() => {
    addEventListener("ReportUnlockToReact", handleUnlock);
    return () => removeEventListener("ReportUnlockToReact", handleUnlock);
  }, [addEventListener, removeEventListener, handleUnlock]);

  // --- RENDER ---

  // State A: Show Unlocked Picture
  if (unlockedPicture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Picture Unlocked! 🎉</h2>
            <p className="mt-2 text-gray-600">
              From {unlockedPicture.sender.name}
              {unlockedPicture.sender.username && ` (@${unlockedPicture.sender.username})`}
            </p>
          </div>

          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={`http://localhost:3000${unlockedPicture.mediaUrl}`}
              alt="Unlocked picture"
              className="w-full h-auto"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Shared on {new Date(unlockedPicture.createdAt).toLocaleDateString()}
            </p>
          </div>

          {shareToken && (
            <button
              onClick={() => navigate(`/unlock/${shareToken}`)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // State B: Show Standard Reward
  if (reward) {
    return (
      <div className="p-10 bg-green-50 text-center">
        <h1>🎉 Prize Unlocked!</h1>
        <div className="text-2xl font-bold mt-4">{reward}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 p-2 border"
        >
          Play Again
        </button>
      </div>
    );
  }

  // State C: Show Game (If config exists)
  if (sessionConfig) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        {!isLoaded && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg">
            Loading Game Engine...
          </div>
        )}
        <Unity
          unityProvider={unityProvider}
          style={{
            width: 1280,
            height: 720,
            border: "2px solid #4a5568",
            borderRadius: "8px",
          }}
        />
      </div>
    );
  }

  // State D: Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Starting game...</p>
        </div>
      </div>
    );
  }

  // State E: Selection Screen (only if no shareToken)
  if (!shareToken) {
    return (
      <div className="p-10">
        <h1 className="text-2xl mb-6">Choose a Challenge to Unlock Content</h1>
        <div className="flex gap-4">
          <button
            onClick={() => handleSelectGame("robbie")}
            className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Play Robbie Game
          </button>
          <button
            onClick={() => handleSelectGame("pipe")}
            className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Play Pipe Game
          </button>
          <button
            onClick={() => handleSelectGame("quickmath")}
            className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Play Quick Math Game
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Game;
