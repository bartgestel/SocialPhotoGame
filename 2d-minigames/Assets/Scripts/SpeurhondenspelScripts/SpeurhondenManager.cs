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

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        Time.timeScale = 1f;
        if (deathPanel != null) deathPanel.SetActive(false);

        if (playerStart != null)
        {
            lastCheckpoint = playerStart.position;
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
        PlayerController player = FindObjectOfType<PlayerController>();
        if (player != null)
        {
            player.transform.position = lastCheckpoint;
            player.ResetMovement();
        }
        if (deathPanel != null)
            deathPanel.SetActive(false);
    }

    public void CollectBone()
    {
        bonesCollected++;
        BoneUIManager.Instance.UpdateUI(bonesCollected);
    }

    public void SetCheckpoint(Vector3 checkpointPosition)
    {
        lastCheckpoint = checkpointPosition;
    }
}