using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;

public class UIManager : MonoBehaviour
{
    public static UIManager Instance;

    [Header("Lives System")]
    public int maxLives = 3;
    private int currentLives;
    public TextMeshProUGUI livesText;

    [Header("Victory System")]
    public int totalSquares = 1150;
    public int squaresToWin = 800;
    public TextMeshProUGUI victoryText;

    [Header("Player")]
    public XonixController player;
    public Vector2 playerSpawnPosition;

    private int squaresDeleted = 0;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }

        currentLives = maxLives;

        if (player != null)
        {
            playerSpawnPosition = player.transform.position;
        }

        UpdateLivesUI();

        if (victoryText != null)
        {
            victoryText.gameObject.SetActive(false);
        }
    }

    public int GetCurrentLives()
    {
        return currentLives;
    }

    public void AddDeletedSquares(int count)
    {
        squaresDeleted += count;

        if (squaresDeleted >= squaresToWin)
        {
            Victory();
        }
    }

    public void PlayerDied()
    {
        currentLives--;

        Debug.Log($"Player died! Lives remaining: {currentLives}");

        UpdateLivesUI();

        if (currentLives <= 0)
        {
            GameOver();
        }
        else
        {
            RespawnPlayer();
        }
    }

    private void UpdateLivesUI()
    {
        if (livesText != null)
        {
            livesText.text = currentLives.ToString();
        }
    }

    private void RespawnPlayer()
    {
        if (player != null)
        {
            player.Respawn(playerSpawnPosition);
        }

        if (XonixManager.Instance != null)
        {
            XonixManager.Instance.ResetTrail();
        }
    }

    private void Victory()
    {
        Debug.Log("VICTORY!");

        if (victoryText != null)
        {
            victoryText.gameObject.SetActive(true);
            victoryText.text = "VICTORY!";
        }

        Time.timeScale = 0f;
    }

    private void GameOver()
    {
        Debug.Log("GAME OVER!");

        if (victoryText != null)
        {
            victoryText.gameObject.SetActive(true);
            victoryText.text = "GAME OVER";
        }

        Time.timeScale = 0f;
    }

    public void RestartGame()
    {
        Time.timeScale = 1f;
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
}