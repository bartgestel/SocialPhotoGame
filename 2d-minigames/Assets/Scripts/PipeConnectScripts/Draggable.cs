using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(Rigidbody2D))]
public class Draggable : MonoBehaviour
{
    private bool isDragging = false;
    private Vector3 offset;
    private Camera mainCamera;
    private Rigidbody2D rb;

    [Header("Colliders")]
    public Collider2D snapCollider; // Volledige grootte voor snapping
    public Collider2D moveCollider; // 0.9 grootte voor beweging

    [Header("Snap Settings")]
    public float snapDistance = 1f;
    public LayerMask snappableLayer;

    private void Start()
    {
        mainCamera = Camera.main;
        rb = GetComponent<Rigidbody2D>();

        rb.gravityScale = 0;
        rb.freezeRotation = true;
        rb.bodyType = RigidbodyType2D.Dynamic;
        rb.constraints = RigidbodyConstraints2D.FreezeAll;
    }

    private void Update()
    {
        Vector2 mousePos = mainCamera.ScreenToWorldPoint(Mouse.current.position.ReadValue());

        if (Mouse.current.leftButton.wasPressedThisFrame)
        {
            // Check met BEIDE colliders voor klikken
            if (snapCollider.OverlapPoint(mousePos) || moveCollider.OverlapPoint(mousePos))
            {
                offset = transform.position - (Vector3)mousePos;
                isDragging = true;
                rb.constraints = RigidbodyConstraints2D.FreezeRotation;
            }
        }

        if (isDragging && Keyboard.current.leftShiftKey.wasPressedThisFrame)
        {
            TrySnapToNearestObject();
        }

        if (Mouse.current.leftButton.wasReleasedThisFrame)
        {
            isDragging = false;
            rb.linearVelocity = Vector2.zero;
            rb.constraints = RigidbodyConstraints2D.FreezeAll;
        }
    }

    private void FixedUpdate()
    {
        if (isDragging)
        {
            Vector2 mousePos = mainCamera.ScreenToWorldPoint(Mouse.current.position.ReadValue());
            Vector2 targetPos = (Vector2)((Vector3)mousePos + offset);

            rb.MovePosition(targetPos);
        }
    }

    private void TrySnapToNearestObject()
    {
        Collider2D[] nearbyObjects = Physics2D.OverlapCircleAll(transform.position, snapDistance, snappableLayer);

        GameObject nearestObject = null;
        float nearestDistance = snapDistance;

        foreach (Collider2D nearby in nearbyObjects)
        {
            // Skip beide colliders van dit object
            if (nearby == snapCollider || nearby == moveCollider) continue;

            float distance = Vector2.Distance(transform.position, nearby.transform.position);
            if (distance < nearestDistance)
            {
                nearestDistance = distance;
                nearestObject = nearby.gameObject;
            }
        }

        if (nearestObject != null)
        {
            Debug.Log($"Snapping {gameObject.name} to {nearestObject.name}");

            Vector2 direction = ((Vector2)transform.position - (Vector2)nearestObject.transform.position);
            bool isHorizontal = Mathf.Abs(direction.x) > Mathf.Abs(direction.y);

            // Gebruik de SNAP collider voor exacte grootte berekening
            Collider2D nearestSnapCollider = nearestObject.GetComponent<Draggable>()?.snapCollider;
            if (nearestSnapCollider == null)
            {
                // Als het geen Draggable is, gebruik gewoon de eerste collider
                nearestSnapCollider = nearestObject.GetComponent<Collider2D>();
            }

            Vector2 thisExtents = snapCollider.bounds.extents;
            Vector2 otherExtents = nearestSnapCollider.bounds.extents;

            Vector2 snapPosition = nearestObject.transform.position;

            if (isHorizontal)
            {
                float offset = thisExtents.x + otherExtents.x;
                snapPosition.x += Mathf.Sign(direction.x) * offset;
                snapPosition.y = nearestObject.transform.position.y;
            }
            else
            {
                float offset = thisExtents.y + otherExtents.y;
                snapPosition.y += Mathf.Sign(direction.y) * offset;
                snapPosition.x = nearestObject.transform.position.x;
            }

            isDragging = false;
            transform.position = new Vector3(snapPosition.x, snapPosition.y, transform.position.z);
            rb.linearVelocity = Vector2.zero;
            rb.constraints = RigidbodyConstraints2D.FreezeAll;

            Debug.Log($"Snapped using snap collider size: {snapCollider.bounds.size}");
        }
    }

    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, snapDistance);

        // Teken beide colliders
        if (snapCollider != null)
        {
            Gizmos.color = Color.green;
            Gizmos.DrawWireCube(snapCollider.bounds.center, snapCollider.bounds.size);
        }
        if (moveCollider != null)
        {
            Gizmos.color = Color.blue;
            Gizmos.DrawWireCube(moveCollider.bounds.center, moveCollider.bounds.size);
        }
    }
}