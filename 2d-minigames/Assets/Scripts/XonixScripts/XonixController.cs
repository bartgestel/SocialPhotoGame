using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(Rigidbody2D))]
public class XonixController : MonoBehaviour
{
    public float moveSpeed = 5f;
    public float gridSize = 1f;
    private Rigidbody2D rb;
    private Vector2 targetPos;
    private bool isMoving = false;
    public InputActionAsset inputActions;
    private InputAction moveAction;
    private static Collider2D[] hitBuffer = new Collider2D[8];
    private bool isOnBorder = true;
    private bool wasOnRedBlock = false;

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
        int count = Physics2D.OverlapBoxNonAlloc(
            newPos,
            Vector2.one * 0.8f,
            0f,
            hitBuffer
        );
        for (int i = 0; i < count; i++)
        {
            Collider2D hit = hitBuffer[i];
            if (hit == null || hit.gameObject == gameObject) continue;
            if (hit.isTrigger) continue;
            if (hit.CompareTag("Enemy"))
                continue;
            return;
        }
        targetPos = newPos;
        isMoving = true;
    }

    private void FixedUpdate()
    {
        if (!isMoving) return;
        rb.position = Vector2.MoveTowards(
            rb.position,
            targetPos,
            moveSpeed * Time.fixedDeltaTime
        );
        if (Vector2.Distance(rb.position, targetPos) < 0.01f)
        {
            rb.position = targetPos;
            isMoving = false;
            CheckBlockUnderPlayer();
        }
    }

    private void CheckBlockUnderPlayer()
    {
        int count = Physics2D.OverlapPointNonAlloc(transform.position, hitBuffer);
        bool onBorderNow = false;
        bool onRedBlock = false;
        bool onEmptySpace = true;
        RedBlock redBlock = null;

        for (int i = 0; i < count; i++)
        {
            Collider2D hit = hitBuffer[i];
            if (hit == null || hit.gameObject == gameObject) continue;
            if (hit.CompareTag("Border"))
            {
                onBorderNow = true;
                onEmptySpace = false;
            }
            RedBlock red = hit.GetComponent<RedBlock>();
            if (red != null)
            {
                onRedBlock = true;
                onEmptySpace = false;
                redBlock = red;
            }
        }

        if (onRedBlock && redBlock != null)
        {
            if (!redBlock.isGreen)
            {
                redBlock.TurnGreen();
                wasOnRedBlock = true;
                isOnBorder = false;
            }
        }

        if ((onBorderNow || onEmptySpace) && wasOnRedBlock)
        {
            if (XonixManager.Instance != null)
            {
                XonixManager.Instance.CompleteTrail();
            }
            wasOnRedBlock = false;
            isOnBorder = true;
        }
        else if (onBorderNow)
        {
            isOnBorder = true;
        }
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Enemy"))
        {
            if (XonixManager.Instance != null)
            {
                XonixManager.Instance.ResetTrail();
            }
            wasOnRedBlock = false;
            Debug.Log("Hit by enemy!");
        }
    }
}