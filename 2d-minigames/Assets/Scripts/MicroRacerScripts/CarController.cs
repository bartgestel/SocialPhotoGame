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
    public FinishLine finishLine; // drag your FinishLine object here

    void Start()
    {
        normalSpeed = speed;

        // Block instant win on spawn (since you spawn on finish)
        if (finishLine != null)
        {
            finishLine.ResetFinishGate();
        }

        // Start countdown at game start
        if (countdown != null)
        {
            StartCoroutine(DoCountdown());
        }
    }

    void Update()
    {
        if (finished) return;
        if (respawning) return;
        if (countingDown) return;

        transform.Translate(Vector3.up * speed * Time.deltaTime);

        float steer = Input.GetAxisRaw("Horizontal");
        if (steer != 0)
        {
            transform.Rotate(Vector3.forward * -steer * turnSpeed * Time.deltaTime);
        }

        speed = inOil ? slowSpeed : normalSpeed;
    }

    void OnTriggerEnter2D(Collider2D col)
    {
        if (col.CompareTag("Oil"))
        {
            inOil = true;
        }

        // Finish is handled by FinishLine.cs now
    }

    void OnTriggerExit2D(Collider2D col)
    {
        if (col.CompareTag("Oil"))
        {
            inOil = false;
        }
    }

    void OnCollisionEnter2D(Collision2D col)
    {
        if (col.collider.CompareTag("Wall") && !respawning && !finished)
        {
            StartCoroutine(Respawn());
        }
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

        // After respawn, also block instant win again until player leaves finish trigger
        if (finishLine != null)
        {
            finishLine.ResetFinishGate();
        }

        // Start countdown again after respawn
        if (countdown != null)
        {
            StartCoroutine(DoCountdown());
        }
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
        finished = true;
        speed = 0f;
        turnSpeed = 0f;
        Debug.Log("FINISH!");
    }
}
