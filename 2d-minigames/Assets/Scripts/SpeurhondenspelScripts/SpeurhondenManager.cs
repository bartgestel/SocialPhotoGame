using UnityEngine;
using UnityEngine.SceneManagement;

public class SpeurhondenManager : MonoBehaviour
{
    public static SpeurhondenManager Instance;

    public GameObject deathPanel;

    private void Awake()
    {
        Instance = this;
        deathPanel.SetActive(false);
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
