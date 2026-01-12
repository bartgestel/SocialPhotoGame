using UnityEngine;
using UnityEngine.SceneManagement;

public class SpeurhondenManager : MonoBehaviour
{
    public static SpeurhondenManager Instance;

    public GameObject deathPanel;

    public int gridSize = 2; // 2x2 grid for puzzle pieces

    private void Awake()
    {
        Instance = this;
        deathPanel.SetActive(false);
        
        // Load puzzle pieces if this is a puzzle game
        LoadPuzzlePiecesIfNeeded();
    }

    private void LoadPuzzlePiecesIfNeeded()
    {
        // Check if GameCoordinator has a pictureId (meaning this is a puzzle game)
        if (GameCoordinatorScript.Instance != null)
        {
            string gameId = GameCoordinatorScript.Instance.CurrentGameId;
            
            // You can check if this specific game should use puzzle pieces
            // For now, we'll always try to load if we have a pictureId from PlayerPrefs
            string pictureId = PlayerPrefs.GetString("CurrentPictureId", "");
            
            if (!string.IsNullOrEmpty(pictureId))
            {
                Debug.Log($"Loading puzzle pieces for picture: {pictureId}");
                PuzzlePieceLoader loader = gameObject.AddComponent<PuzzlePieceLoader>();
                
                // Set consistent pixel size for all pieces
                loader.targetPixelWidth = 128;  // All pieces will be 128x128 pixels
                loader.targetPixelHeight = 128;
                loader.pixelsPerUnit = 100f;    // Adjust this to control world size
                
                loader.LoadPuzzlePieces(pictureId, gridSize, OnPuzzlePiecesLoaded);
            }
        }
    }

    private void OnPuzzlePiecesLoaded(Sprite[] pieces, PuzzleResponse puzzleData)
    {
        if (pieces == null || pieces.Length == 0)
        {
            Debug.LogWarning("No puzzle pieces loaded, using default sprites");
            return;
        }

        Debug.Log($"Successfully loaded {pieces.Length} puzzle pieces");

        // Find all bone pickups in the scene
        BonePickup[] bones = FindObjectsOfType<BonePickup>();
        
        Debug.Log($"Found {bones.Length} bones to replace with puzzle pieces");

        // Replace bone sprites with puzzle pieces
        for (int i = 0; i < bones.Length && i < pieces.Length; i++)
        {
            SpriteRenderer spriteRenderer = bones[i].GetComponent<SpriteRenderer>();
            if (spriteRenderer != null)
            {
                spriteRenderer.sprite = pieces[i];
                Debug.Log($"Replaced bone {i} with puzzle piece {i}");
            }
        }
    }

    public void PlayerDied()
    {
        Time.timeScale = 0f;
        deathPanel.SetActive(true);
    }

    public void RestartGame()
    {
        Time.timeScale = 1f;
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
}
