using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;
using System.Collections;
using System.Security.Cryptography;
using System.Text;
using System.Runtime.InteropServices;

[System.Serializable]
public class GameConfig
{
    public string sessionId;
    public string unityScene;
    public string gameId;
    public string pictureId;
}

public class GameCoordinatorScript : MonoBehaviour {
    public static GameCoordinatorScript Instance;

    private string _currentSessionId;
    private string _currentUnityScene;
    private string _currentGameId;
    private const string SECRET_KEY = "A64814991BEEC14ED7747FE2E1AFD"; // Must match backend
    private const string API_URL = "http://localhost:3000/api/games/verify";

    // Public getters
    public string CurrentGameId => _currentGameId;
    public string CurrentSessionId => _currentSessionId;

    [DllImport("__Internal")]
    private static extern void ReportUnlockToReact(string gameId);

    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
    }

    public void InitializeGame(string jsonConfig){
        GameConfig config = JsonUtility.FromJson<GameConfig>(jsonConfig);
        _currentSessionId = config.sessionId;
        _currentGameId = config.gameId;
        
        // Store pictureId for puzzle games
        if (!string.IsNullOrEmpty(config.pictureId)) {
            PlayerPrefs.SetString("CurrentPictureId", config.pictureId);
            PlayerPrefs.Save();
            Debug.Log($"Stored pictureId: {config.pictureId}");
        }
        
        SceneManager.LoadScene(config.unityScene);
    }

    public void TriggerWin(){
        StartCoroutine(VerifyWinRoutine());
    }

    IEnumerator VerifyWinRoutine() {
        string rawPayload = $"{_currentSessionId}:{_currentGameId}:WIN";
        string signature = GenerateHMAC(rawPayload, SECRET_KEY);

        string jsonBody = $"{{\"sessionId\":\"{_currentSessionId}\", \"signature\":\"{signature}\"}}";

        var request = new UnityWebRequest(API_URL, "POST");
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success) {
            ReportUnlockToReact(request.downloadHandler.text);
        }
    }

    private string GenerateHMAC(string message, string key) {
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] messageBytes = Encoding.UTF8.GetBytes(message);
        using (var hmac = new HMACSHA256(keyBytes)) {
            byte[] hash = hmac.ComputeHash(messageBytes);
            return System.BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}