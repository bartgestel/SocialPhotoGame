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

    private Animator animator;
    private SpriteRenderer spriteRenderer;

    private static Collider2D[] hitBuffer = new Collider2D[5];

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;

        animator = GetComponent<Animator>();
        spriteRenderer = GetComponent<SpriteRenderer>();

        moveAction = inputActions.FindActionMap("Player").FindAction("Move");
        targetPos = rb.position;
    }

    private void OnEnable() => moveAction.Enable();
    private void OnDisable() => moveAction.Disable();

    private void Update()
    {
        if (isMoving)
        {
            animator.speed = 1f;
            return;
        }

        Vector2 input = moveAction.ReadValue<Vector2>();

        if (Mathf.Abs(input.x) > Mathf.Abs(input.y))
            input = new Vector2(Mathf.Sign(input.x), 0);
        else if (input != Vector2.zero)
            input = new Vector2(0, Mathf.Sign(input.y));
        else
        {
            animator.speed = 0f; 
            return;
        }

        if (input.x < 0)
            spriteRenderer.flipX = true;
        else if (input.x > 0)
            spriteRenderer.flipX = false;

        animator.speed = 1f;
        TryMove(input);
    }

    private void TryMove(Vector2 dir)
    {
        Vector2 newPos = rb.position + dir * gridSize;

        int count = Physics2D.OverlapBoxNonAlloc(newPos, Vector2.one * 0.8f, 0f, hitBuffer);
        for (int i = 0; i < count; i++)
        {
            Collider2D hit = hitBuffer[i];
            if (hit == null || hit.gameObject == gameObject) continue;
            if (hit.isTrigger) continue;

            if (!hit.CompareTag("Pushable")) return;

            Pushable p = hit.GetComponent<Pushable>();
            if (!p.TryPush(dir)) return;
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
            animator.speed = 0f; 
        }
    }
}
