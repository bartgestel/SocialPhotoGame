using UnityEngine;
using TMPro;
using UnityEngine.InputSystem;

public class QuickMath : MonoBehaviour
{
    [Header("UI Elements")]
    public TMP_InputField answerInput;
    public Transform questionsContainer;

    [Header("Question Prefab")]
    public GameObject questionPrefab;

    [Header("Game Settings")]
    public float fallSpeed = 100f;
    public float spawnDelay = 3f;
    public int questionsToWin = 10;

    private int correctAnswers = 0;
    private int currentAnswer;
    private GameObject currentQuestion;
    private float nextSpawnTime;
    private bool gameActive = false;
    private float screenBottom;

    private void Start()
    {
        screenBottom = Camera.main.ScreenToWorldPoint(new Vector3(0, -100, 0)).y;
        StartGame();
    }

    public void StartGame()
    {
        correctAnswers = 0;
        gameActive = true;
        nextSpawnTime = Time.time;

        answerInput.text = "";
        answerInput.Select();
        answerInput.ActivateInputField();

        SpawnQuestion();
    }

    private void Update()
    {
        if (!gameActive) return;

        if (currentQuestion != null)
        {
            currentQuestion.transform.position += Vector3.down * fallSpeed * Time.deltaTime;

            if (currentQuestion.transform.position.y < screenBottom)
            {
                GameOver();
                return;
            }
        }

        // NEW INPUT SYSTEM - Check voor Enter
        if (Keyboard.current.enterKey.wasPressedThisFrame ||
            Keyboard.current.numpadEnterKey.wasPressedThisFrame)
        {
            CheckAnswer();
        }
    }

    private void SpawnQuestion()
    {
        if (currentQuestion != null)
            Destroy(currentQuestion);

        int num1 = Random.Range(1, 11);
        int num2 = Random.Range(1, 11);
        int operation = Random.Range(0, 2);

        string questionString;
        if (operation == 0)
        {
            questionString = $"{num1} + {num2} = ?";
            currentAnswer = num1 + num2;
        }
        else
        {
            if (num1 < num2)
            {
                int temp = num1;
                num1 = num2;
                num2 = temp;
            }
            questionString = $"{num1} - {num2} = ?";
            currentAnswer = num1 - num2;
        }

        currentQuestion = Instantiate(questionPrefab, questionsContainer);
        TextMeshProUGUI questionText = currentQuestion.GetComponent<TextMeshProUGUI>();
        questionText.text = questionString;

        RectTransform rt = currentQuestion.GetComponent<RectTransform>();
        rt.anchoredPosition = new Vector2(0, 300);

        Debug.Log($"Question: {questionString}, Answer: {currentAnswer}");
    }

    private void CheckAnswer()
    {
        if (string.IsNullOrEmpty(answerInput.text))
            return;

        int playerAnswer;
        if (int.TryParse(answerInput.text, out playerAnswer))
        {
            if (playerAnswer == currentAnswer)
            {
                correctAnswers++;
                Debug.Log($"Correct! Total: {correctAnswers}/{questionsToWin}");

                if (correctAnswers >= questionsToWin)
                {
                    Victory();
                    return;
                }

                answerInput.text = "";
                SpawnQuestion();
                answerInput.Select();
                answerInput.ActivateInputField();
            }
            else
            {
                Debug.Log("Wrong answer!");
                GameOver();
            }
        }
    }

    private void Victory()
    {
        gameActive = false;
        Debug.Log(" YOU WIN! All questions answered! ");

        if (GameCoordinatorScript.Instance != null)
        {
            GameCoordinatorScript.Instance.TriggerWin();
        }

        if (currentQuestion != null)
            Destroy(currentQuestion);
    }

    private void GameOver()
    {
        gameActive = false;
        Debug.Log(" GAME OVER! Question fell off screen or wrong answer! ");

        if (currentQuestion != null)
            Destroy(currentQuestion);
    }
}