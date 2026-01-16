using UnityEngine;
using UnityEngine.SceneManagement;

public class SpeurhondenManager : MonoBehaviour
{
    public static SpeurhondenManager Instance;
    public GameObject deathPanel;
    public Transform playerStart;
    public int totalBones = 3;
    [HideInInspector] public int bonesCollected = 0;
    private bool isGameOver = false;
    private Vector3 lastCheckpoint;

    public int gridSize = 2;

    public AudioClip BonePickupSound;
    public AudioSource audioSource;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        deathPanel.SetActive(false);
        
        LoadPuzzlePiecesIfNeeded();

        audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }
    }

    private void LoadPuzzlePiecesIfNeeded()
    {
        if (GameCoordinatorScript.Instance != null)
        {
            string gameId = GameCoordinatorScript.Instance.CurrentGameId;
            
            string pictureId = PlayerPrefs.GetString("CurrentPictureId", "");
            
            if (!string.IsNullOrEmpty(pictureId))
            {
                Debug.Log($"Loading puzzle pieces for picture: {pictureId}");
                PuzzlePieceLoader loader = gameObject.AddComponent<PuzzlePieceLoader>();
                
                loader.targetPixelWidth = 128;
                loader.targetPixelHeight = 128;
                loader.pixelsPerUnit = 100f;    
                
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

        BonePickup[] bones = FindObjectsByType<BonePickup>(FindObjectsSortMode.None);
        
        Debug.Log($"Found {bones.Length} bones to replace with puzzle pieces");

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
        if (isGameOver) return;
        isGameOver = true;
        Time.timeScale = 0f;
        if (deathPanel != null) deathPanel.SetActive(true);
    }

    public void RestartPlayer()
    {
        if (!isGameOver) return;
        isGameOver = false;
        Time.timeScale = 1f;

        PlayerController player = FindFirstObjectByType<PlayerController>();
        if (player != null)
        {
            player.transform.position = lastCheckpoint;
            player.ResetMovement();
        }

        ResettableObject[] resettables = FindObjectsByType<ResettableObject>(FindObjectsSortMode.None);

        foreach (ResettableObject resettable in resettables)
        {
            resettable.ResetPosition();
        }

        if (deathPanel != null)
        {
            deathPanel.SetActive(false);
        }

        if (audioSource != null)
        {
            audioSource.Play();
        }

    }

    public void CollectBone()
    {
        bonesCollected++;
        BoneUIManager.Instance.UpdateUI(bonesCollected);
        audioSource.PlayOneShot(BonePickupSound);
    }

    public void SetCheckpoint(Vector3 checkpointPosition)
    {
        lastCheckpoint = checkpointPosition;
    }
}