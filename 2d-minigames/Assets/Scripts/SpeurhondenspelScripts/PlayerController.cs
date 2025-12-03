using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(Rigidbody2D))]
public class PlayerController : MonoBehaviour
{
    public float moveSpeed = 5f;
    public float gridSize = 1f;

    private Vector2 targetPos;
    private bool isMoving = false;
    private Rigidbody2D rb;

    public InputActionAsset inputActions;
    private InputAction moveAction;

    private static Collider2D[] hitBuffer = new Collider2D[5]; // NonAlloc buffer

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0;
        rb.angularVelocity = 0;

        moveAction = inputActions.FindActionMap("Player").FindAction("Move");
        targetPos = rb.position;
    }

    private void OnEnable() => moveAction.Enable();
    private void OnDisable() => moveAction.Disable();

    private void Update()
    {
        if (isMoving) return;

        Vector2 input = moveAction.ReadValue<Vector2>();

        if (Mathf.Abs(input.x) > Mathf.Abs(input.y))
            input = new Vector2(Mathf.Sign(input.x), 0);
        else if (input != Vector2.zero)
            input = new Vector2(0, Mathf.Sign(input.y));
        else
            return;

        TryMove(input);
    }

    private void TryMove(Vector2 dir)
    {
        Vector2 newPos = rb.position + dir * gridSize;

        int numHits = Physics2D.OverlapBoxNonAlloc(newPos, Vector2.one * 0.8f, 0f, hitBuffer);
        for (int i = 0; i < numHits; i++)
        {
            Collider2D hit = hitBuffer[i];
            if (hit.isTrigger) continue;

            if (hit == null || hit.gameObject == gameObject) continue;

            if (hit.CompareTag("Pushable"))
            {
                Pushable pushable = hit.GetComponent<Pushable>();
                if (!pushable.TryPush(dir)) return; 
            }
            else
            {
                return; 
            }
        }

        targetPos = newPos;
        isMoving = true;
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
}
