using UnityEngine;
using System.Collections;

public class CarController : MonoBehaviour
{
    public float speed = 5f;
    public float turnSpeed = 150f;

    private float normalSpeed;
    private bool inOil = false;
    public float slowSpeed = 2f;

    public Transform respawnPoint;
    public float respawnDelay = 0.5f;
    private bool respawning = false;
    private bool finished = false;

    [Header("Countdown")]
    public CountdownManager countdown;
    private bool countingDown = false;

    [Header("Finish Gate")]
    public FinishLine finishLine;

    void Start()
    {
        normalSpeed = speed;

        if (finishLine != null)
            finishLine.ResetFinishGate();

        if (countdown != null)
            StartCoroutine(DoCountdown());
    }

    void Update()
    {
        if (finished || respawning || countingDown)
            return;

        // Drive forward
        transform.Translate(Vector3.up * speed * Time.deltaTime);

        // Steering (keyboard + touch)
        float steer = GetSteerInput();
        if (steer != 0f)
        {
            transform.Rotate(Vector3.forward * -steer * turnSpeed * Time.deltaTime);
        }

        // Oil slow-down
        speed = inOil ? slowSpeed : normalSpeed;
    }

float GetSteerInput()
{
    // Keyboard (PC)
    float steer = Input.GetAxisRaw("Horizontal");

    // Mouse input (Editor testing)
    if (Input.GetMouseButton(0)) // left mouse button held
    {
        if (Input.mousePosition.x < Screen.width / 2f)
            steer = -1f;
        else
            steer = 1f;
    }

    // Touch input (Mobile)
    if (Input.touchCount > 0)
    {
        Touch touch = Input.GetTouch(0);

        if (touch.position.x < Screen.width / 2f)
            steer = -1f;
        else
            steer = 1f;
    }

    return steer;
}


    void OnTriggerEnter2D(Collider2D col)
    {
        if (col.CompareTag("Oil"))
            inOil = true;
    }

    void OnTriggerExit2D(Collider2D col)
    {
        if (col.CompareTag("Oil"))
            inOil = false;
    }

    void OnCollisionEnter2D(Collision2D col)
    {
        if (col.collider.CompareTag("Wall") && !respawning && !finished)
            StartCoroutine(Respawn());
    }

    private IEnumerator Respawn()
    {
        respawning = true;

        float oldSpeed = speed;
        speed = 0f;

        yield return new WaitForSeconds(respawnDelay);

        transform.position = respawnPoint.position;
        transform.rotation = respawnPoint.rotation;

        speed = oldSpeed;
        respawning = false;

        if (finishLine != null)
            finishLine.ResetFinishGate();

        if (countdown != null)
            StartCoroutine(DoCountdown());
    }

    private IEnumerator DoCountdown()
    {
        countingDown = true;

        countdown.StartCountdown();

        yield return new WaitForSeconds(3.5f);

        countingDown = false;
    }

    public void FinishRace()
    {
        if (GameCoordinatorScript.Instance != null)
        {
            GameCoordinatorScript.Instance.TriggerWin();
        }

        finished = true;
        speed = 0f;
        turnSpeed = 0f;
        Debug.Log("FINISH!");
    }
}
