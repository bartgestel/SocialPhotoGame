using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;
using System;

[System.Serializable]
public class PuzzlePieceData
{
    public int index;
    public int row;
    public int col;
    public string data; // base64 string
}

[System.Serializable]
public class PuzzleResponse
{
    public string pictureId;
    public int gridSize;
    public int totalPieces;
    public int imageWidth;
    public int imageHeight;
    public int tileWidth;
    public int tileHeight;
    public PuzzlePieceData[] tiles;
}

public class PuzzlePieceLoader : MonoBehaviour
{
    private const string API_BASE_URL = "http://localhost:3000/api/pictures";
    
    // Default pixels per unit for sprites (higher = smaller in-game size)
    public float pixelsPerUnit = 100f;
    
    // Target pixel size for all pieces (0 = use original size)
    public int targetPixelWidth = 256;
    public int targetPixelHeight = 256;
    
    /// <summary>
    /// Load puzzle pieces from the backend API
    /// </summary>
    /// <param name="pictureId">The ID of the picture to slice</param>
    /// <param name="gridSize">Grid size (e.g., 3 for 3x3 grid)</param>
    /// <param name="callback">Callback with array of Sprite2D pieces</param>
    public void LoadPuzzlePieces(string pictureId, int gridSize, Action<Sprite[], PuzzleResponse> callback)
    {
        StartCoroutine(LoadPuzzlePiecesRoutine(pictureId, gridSize, callback));
    }
    
    /// <summary>
    /// Load puzzle pieces with custom pixels per unit
    /// </summary>
    public void LoadPuzzlePieces(string pictureId, int gridSize, float customPixelsPerUnit, Action<Sprite[], PuzzleResponse> callback)
    {
        pixelsPerUnit = customPixelsPerUnit;
        StartCoroutine(LoadPuzzlePiecesRoutine(pictureId, gridSize, callback));
    }
    
    /// <summary>
    /// Load puzzle pieces with custom target size
    /// </summary>
    public void LoadPuzzlePieces(string pictureId, int gridSize, int targetWidth, int targetHeight, Action<Sprite[], PuzzleResponse> callback)
    {
        targetPixelWidth = targetWidth;
        targetPixelHeight = targetHeight;
        StartCoroutine(LoadPuzzlePiecesRoutine(pictureId, gridSize, callback));
    }

    private IEnumerator LoadPuzzlePiecesRoutine(string pictureId, int gridSize, Action<Sprite[], PuzzleResponse> callback)
    {
        string url = $"{API_BASE_URL}/{pictureId}/pieces?gridSize={gridSize}";
        
        UnityWebRequest request = UnityWebRequest.Get(url);
        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"Failed to load puzzle pieces: {request.error}");
            callback?.Invoke(null, null);
            yield break;
        }

        string json = request.downloadHandler.text;
        Debug.Log($"Received puzzle data: {json.Substring(0, Mathf.Min(200, json.Length))}...");

        PuzzleResponse puzzleResponse = JsonUtility.FromJson<PuzzleResponse>(json);

        if (puzzleResponse == null || puzzleResponse.tiles == null)
        {
            Debug.LogError("Failed to parse puzzle response");
            callback?.Invoke(null, null);
            yield break;
        }

        // Convert base64 tiles to sprites
        Sprite[] sprites = new Sprite[puzzleResponse.tiles.Length];

        for (int i = 0; i < puzzleResponse.tiles.Length; i++)
        {
            PuzzlePieceData tile = puzzleResponse.tiles[i];
            
            // Decode base64 to byte array
            byte[] imageBytes = Convert.FromBase64String(tile.data);
            
            // Create texture
            Texture2D originalTexture = new Texture2D(2, 2);
            if (originalTexture.LoadImage(imageBytes))
            {
                Texture2D finalTexture = originalTexture;
                
                // Resize if target size is specified
                if (targetPixelWidth > 0 && targetPixelHeight > 0)
                {
                    finalTexture = ResizeTexture(originalTexture, targetPixelWidth, targetPixelHeight);
                    Destroy(originalTexture); // Clean up original
                }
                
                // Create sprite from texture with custom pixels per unit
                sprites[tile.index] = Sprite.Create(
                    finalTexture,
                    new Rect(0, 0, finalTexture.width, finalTexture.height),
                    new Vector2(0.5f, 0.5f),
                    pixelsPerUnit  // Controls the size: higher value = smaller sprite
                );
                
                Debug.Log($"Loaded tile {tile.index} (Row: {tile.row}, Col: {tile.col}) - Size: {finalTexture.width}x{finalTexture.height}px, PPU: {pixelsPerUnit}");
            }
            else
            {
                Debug.LogError($"Failed to load image for tile {tile.index}");
            }
        }

        Debug.Log($"Successfully loaded {sprites.Length} puzzle pieces");
        callback?.Invoke(sprites, puzzleResponse);
    }
    
    /// <summary>
    /// Resize a texture to target dimensions
    /// </summary>
    private Texture2D ResizeTexture(Texture2D source, int targetWidth, int targetHeight)
    {
        RenderTexture rt = RenderTexture.GetTemporary(targetWidth, targetHeight);
        RenderTexture.active = rt;
        
        Graphics.Blit(source, rt);
        
        Texture2D result = new Texture2D(targetWidth, targetHeight);
        result.ReadPixels(new Rect(0, 0, targetWidth, targetHeight), 0, 0);
        result.Apply();
        
        RenderTexture.active = null;
        RenderTexture.ReleaseTemporary(rt);
        
        return result;
    }

    // Example usage method
    public void ExampleUsage()
    {
        string pictureId = "your-picture-id-here";
        int gridSize = 3;

        LoadPuzzlePieces(pictureId, gridSize, (sprites, puzzleData) => {
            if (sprites != null && sprites.Length > 0)
            {
                Debug.Log($"Loaded {sprites.Length} pieces for a {puzzleData.gridSize}x{puzzleData.gridSize} grid");
                
                // Now you can use these sprites in your game
                // For example, assign them to SpriteRenderer components:
                // spriteRenderer.sprite = sprites[0];
                
                // Or use them in UI Image components:
                // image.sprite = sprites[0];
                
                // Or pass them to your puzzle game manager:
                // puzzleGameManager.InitializePuzzle(sprites, puzzleData);
            }
            else
            {
                Debug.LogError("Failed to load puzzle pieces");
            }
        });
    }
}
