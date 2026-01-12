using UnityEngine;
using TMPro;
using System.Collections;

public class CountdownManager : MonoBehaviour
{
    [Header("UI")]
    [SerializeField] private TextMeshProUGUI countdownText;

    [Header("Follow")]
    [SerializeField] private Transform followTarget;
    [SerializeField] private Vector3 screenOffset = new Vector3(0f, 80f, 0f); // pixels up

    private Camera cam;
    private bool showing = false;

    void Awake()
    {
        // Grab camera (works even if Camera.main is null at Awake)
        cam = Camera.main;
        if (cam == null)
        {
            cam = FindFirstObjectByType<Camera>();
        }

        // Auto-find text if not assigned
        if (countdownText == null)
        {
            countdownText = GetComponentInChildren<TextMeshProUGUI>(true);
        }

        if (countdownText != null)
        {
            countdownText.gameObject.SetActive(false);
        }
    }

    public void SetTarget(Transform t)
    {
        followTarget = t;
    }

    public void StartCountdown()
    {
        if (countdownText == null)
        {
            Debug.LogError("CountdownManager: countdownText is not assigned/found.");
            return;
        }

        if (!gameObject.activeInHierarchy) return;

        StopAllCoroutines();
        StartCoroutine(Countdown());
    }

    private IEnumerator Countdown()
    {
        showing = true;
        countdownText.gameObject.SetActive(true);

        for (int i = 3; i >= 1; i--)
        {
            countdownText.text = i.ToString();
            yield return new WaitForSeconds(1f);
        }

        countdownText.text = "GO!";
        yield return new WaitForSeconds(0.5f);

        countdownText.gameObject.SetActive(false);
        showing = false;
    }

    void LateUpdate()
    {
        if (!showing) return;
        if (countdownText == null) return;
        if (followTarget == null) return;

        if (cam == null)
        {
            cam = Camera.main;
            if (cam == null) cam = FindFirstObjectByType<Camera>();
            if (cam == null) return;
        }

        Vector3 screenPos = cam.WorldToScreenPoint(followTarget.position);
        countdownText.transform.position = screenPos + screenOffset;
    }
}
