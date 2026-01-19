using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class Pushable : MonoBehaviour
{
    public float moveSpeed = 5f;    
    public float gridSize = 1f;      

    private Vector2 targetPos;
    private bool isMoving = false;
    private Rigidbody2D rb;

    private static Collider2D[] hitBuffer = new Collider2D[5];

    public AudioClip pushableSound;
    private AudioSource audioSource;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0;
        rb.angularVelocity = 0;

        targetPos = transform.position;

        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }
    }

    private void FixedUpdate()
    {
        if (!isMoving) return;

        rb.position = Vector2.MoveTowards(rb.position, targetPos, moveSpeed * Time.fixedDeltaTime);

        if (Vector2.Distance(rb.position, targetPos) < 0.01f)
        {
            rb.position = targetPos;
            isMoving = false;
        }
    }
    public bool TryPush(Vector2 dir)
    {
        if (isMoving) return false;

        Vector2 newPos = (Vector2)transform.position + dir * gridSize;

        int numHits = Physics2D.OverlapBox(newPos, Vector2.one * 0.8f, 0f, ContactFilter2D.noFilter, hitBuffer);
        for (int i = 0; i < numHits; i++)
        {
            Collider2D hit = hitBuffer[i];

            if (hit == null || hit.gameObject == gameObject) continue;

            if (hit.CompareTag("BreakableWall"))
            {
                Destroy(hit.gameObject);
            }
            else if (hit.CompareTag("Pushable"))
            {
                Pushable otherPush = hit.GetComponent<Pushable>();
                if (!otherPush.TryPush(dir)) return false;
            }
            else
            {
                return false; 
            }
        }

        targetPos = newPos;
        isMoving = true;
        audioSource.PlayOneShot(pushableSound);
        return true;
    }
}
