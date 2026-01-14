import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

// Extend window interface to include Unity game completion handler
declare global {
  interface Window {
    unityGameComplete?: (sessionId: string, signature: string, score?: number) => void;
  }
}

export default function UnityGame() {
  const [searchParams] = useSearchParams();
  const scene = searchParams.get("scene");
  const sessionId = searchParams.get("sessionId");
  const gameId = searchParams.get("gameId");
  const pictureId = searchParams.get("pictureId");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Set up handler for Unity game completion
  useEffect(() => {
    window.unityGameComplete = async (sessionId: string, signature: string, score?: number) => {
      console.log("Unity game completed, verifying...", { sessionId, signature, score });
      
      try {
        // Call backend to verify the game completion
        const result = await api.verifyGame(sessionId, signature, score);
        console.log("Verification result:", result);
        
        // If this was a picture unlock game and it was successful, notify parent window
        if (window.parent && window.parent.handleUnityGameComplete) {
          window.parent.handleUnityGameComplete(result);
        }
      } catch (error) {
        console.error("Failed to verify game:", error);
        // Notify parent of failure
        if (window.parent && window.parent.handleUnityGameComplete) {
          window.parent.handleUnityGameComplete({
            success: false,
            error: error instanceof Error ? error.message : "Verification failed"
          });
        }
      }
    };

    return () => {
      delete window.unityGameComplete;
    };
  }, []);

  useEffect(() => {
    // Load Unity loader script
    const script = document.createElement("script");
    script.src = "/game/Build.loader.js";
    script.async = true;
    script.onload = () => {
      // Initialize Unity
      const buildUrl = "/game";
      const config = {
        dataUrl: `${buildUrl}/Build.data`,
        frameworkUrl: `${buildUrl}/Build.framework.js`,
        codeUrl: `${buildUrl}/Build.wasm`,
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: "2d-minigames",
        productVersion: "1.0",
      };

      // @ts-ignore
      if (typeof createUnityInstance !== "undefined") {
        const canvas = document.querySelector("#unity-canvas") as HTMLCanvasElement;
        // @ts-ignore
        createUnityInstance(canvas, config, (progress: number) => {
          setLoadingProgress(Math.floor(progress * 100));
        })
          .then((unityInstance: any) => {
            console.log("Unity loaded successfully");
            
            // Initialize the game with scene and session info
            if (scene && sessionId) {
              const gameConfig = {
                sessionId: sessionId,
                unityScene: scene,
                gameId: gameId || "",
                pictureId: pictureId || ""
              };
              
              console.log("Initializing Unity game with config:", gameConfig);
              
              // Send configuration to Unity's GameCoordinatorScript
              unityInstance.SendMessage(
                "GameCoordinator",
                "InitializeGame",
                JSON.stringify(gameConfig)
              );
            }
          })
          .catch((error: any) => {
            console.error("Error loading Unity:", error);
          });
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [scene, sessionId, gameId, pictureId]);

  return (
    <div 
      className="w-full h-screen m-0 p-0 overflow-hidden"
      style={{ backgroundColor: "#231F20" }}
    >
      {loadingProgress < 100 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl z-[1000]">
          Loading Unity: {loadingProgress}%
        </div>
      )}
      <canvas
        id="unity-canvas"
        className="block w-full h-full"
      />
    </div>
  );
}
