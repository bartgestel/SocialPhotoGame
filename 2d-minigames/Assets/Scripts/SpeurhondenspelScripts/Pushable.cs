using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class Pushable : MonoBehaviour
{
    public float pushSpeed = 5f;
    private Rigidbody2D rb;

    private Vector2 pushDirection = Vector2.zero;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        rb.gravityScale = 0;
        rb.freezeRotation = true;

        rb.linearDamping = 20f;
        rb.angularDamping = 0f;
    }

    private void FixedUpdate()
    {
        if (pushDirection != Vector2.zero)
        {
            Vector2 axisDir = Mathf.Abs(pushDirection.x) > Mathf.Abs(pushDirection.y)
                ? new Vector2(Mathf.Sign(pushDirection.x), 0)
                : new Vector2(0, Mathf.Sign(pushDirection.y));

            rb.linearVelocity = axisDir * pushSpeed;
        }
        else
        {
            rb.linearVelocity = Vector2.zero;
        }
        pushDirection = Vector2.zero;
    }

    public void Push(Vector2 direction)
    {
        pushDirection = direction;
    }

    private void OnCollisionEnter2D(Collision2D collision)
    {
        if (collision.gameObject.CompareTag("BreakableWall"))
        {
            Destroy(collision.gameObject);
        }
    }

}
