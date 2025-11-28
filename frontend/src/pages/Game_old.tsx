import React, { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import axios from "axios";

// Types
interface GameOption {
  id: string;
  name: string;
}
interface SessionConfig {
  sessionId: string;
  unityScene: string;
  gameId: string;
}
interface UnlockData {
  success: boolean;
  rewardData: string;
}

const Game: React.FC = () => {
  // State
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(
    null
  );
  const [reward, setReward] = useState<string | null>(null);

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

  // 1. User selects a game -> Get Config from Backend
  const handleSelectGame = async (gameId: string) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/games/start",
        { gameId }
      );
      setSessionConfig(response.data); // Contains sessionId and sceneName
      setSelectedGame({ id: gameId, name: "Loading..." }); // Simple mock
    } catch (err) {
      console.error("Could not start session", err);
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
      setReward(data.rewardData);
      // Optional: Unload unity or hide it
    }
  }, []);

  useEffect(() => {
    addEventListener("ReportUnlockToReact", handleUnlock);
    return () => removeEventListener("ReportUnlockToReact", handleUnlock);
  }, [addEventListener, removeEventListener, handleUnlock]);

  // --- RENDER ---

  // State A: Show Reward
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

  // State B: Show Game (If config exists)
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

  // State C: Selection Screen
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
};

export default Game;
