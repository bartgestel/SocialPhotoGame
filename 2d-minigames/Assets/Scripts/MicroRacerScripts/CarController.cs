using UnityEngine;

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

    void Start()
    {
        normalSpeed = speed;
    }

    void Update()
    {
        if (finished)
            return; // Auto doet niets meer bij finish

        if (respawning)
            return; // Auto beweegt niet tijdens respawn animatie

        // Auto rijdt vanzelf vooruit
        transform.Translate(Vector3.up * speed * Time.deltaTime);

        // Sturen
        float steer = Input.GetAxisRaw("Horizontal");
        if (steer != 0)
        {
            transform.Rotate(Vector3.forward * -steer * turnSpeed * Time.deltaTime);
        }

        // Snelheid aanpassen als je in olie zit
        speed = inOil ? slowSpeed : normalSpeed;
    }

    void OnTriggerEnter2D(Collider2D col)
    {
        if (col.CompareTag("Oil"))
        {
            inOil = true;
        }

        if (col.CompareTag("Finish"))
        {
            FinishRace();
        }
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
        if (col.collider.CompareTag("Wall") && !respawning)
        {
            StartCoroutine(Respawn());
        }
    }

    private System.Collections.IEnumerator Respawn()
    {
        respawning = true;

        float oldSpeed = speed;
        speed = 0f;

        yield return new WaitForSeconds(respawnDelay);

        transform.position = respawnPoint.position;
        transform.rotation = respawnPoint.rotation;

        speed = oldSpeed;
        respawning = false;
    }

    void FinishRace()
    {
        finished = true;
        speed = 0f;
        turnSpeed = 0f;
        Debug.Log("FINISH!");
    }
}
