using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class EnemyMovement : MonoBehaviour
{
    [Header("Movement Settings")]
    public float speed = 3f;
    public float turnSpeed = 90f;
    public bool constantSpin = false;

    [Header("Boundary Settings")]
    public Vector2 minBounds = new Vector2(-8f, -4.5f);
    public Vector2 maxBounds = new Vector2(8f, 4.5f);

    [Header("Collision Settings")]
    public Vector2 enemyHalfExtents = new Vector2(0.5f, 0.5f);

    private Rigidbody2D rb;
    private Vector2 moveDirection;
    private BoxCollider2D boxCollider;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0;

        boxCollider = GetComponent<BoxCollider2D>();
        if (boxCollider != null)
        {
            enemyHalfExtents = boxCollider.size * 0.5f;
            enemyHalfExtents.x *= transform.localScale.x;
            enemyHalfExtents.y *= transform.localScale.y;
        }

        float randomAngle = Random.Range(0f, 360f);
        moveDirection = new Vector2(
            Mathf.Cos(randomAngle * Mathf.Deg2Rad),
            Mathf.Sin(randomAngle * Mathf.Deg2Rad)
        ).normalized;
    }

    private void FixedUpdate()
    {
        Vector2 currentPos = rb.position;
        Vector2 nextPos = currentPos + moveDirection * speed * Time.fixedDeltaTime;

        CheckEnemyCollisions(currentPos, ref moveDirection);

        nextPos = currentPos + moveDirection * speed * Time.fixedDeltaTime;

        Vector2 effectiveHalfExtents = GetEffectiveHalfExtents();

        bool bounced = false;

        if (nextPos.x - effectiveHalfExtents.x <= minBounds.x)
        {
            nextPos.x = minBounds.x + effectiveHalfExtents.x;
            if (moveDirection.x < 0)
            {
                moveDirection.x = -moveDirection.x;
                bounced = true;
            }
        }
        else if (nextPos.x + effectiveHalfExtents.x >= maxBounds.x)
        {
            nextPos.x = maxBounds.x - effectiveHalfExtents.x;
            if (moveDirection.x > 0)
            {
                moveDirection.x = -moveDirection.x;
                bounced = true;
            }
        }

        if (nextPos.y - effectiveHalfExtents.y <= minBounds.y)
        {
            nextPos.y = minBounds.y + effectiveHalfExtents.y;
            if (moveDirection.y < 0)
            {
                moveDirection.y = -moveDirection.y;
                bounced = true;
            }
        }
        else if (nextPos.y + effectiveHalfExtents.y >= maxBounds.y)
        {
            nextPos.y = maxBounds.y - effectiveHalfExtents.y;
            if (moveDirection.y > 0)
            {
                moveDirection.y = -moveDirection.y;
                bounced = true;
            }
        }

        moveDirection = moveDirection.normalized;

        if (bounced)
        {
            float randomAngle = Random.Range(-10f, 10f);
            moveDirection = Rotate(moveDirection, randomAngle).normalized;

            if (!constantSpin)
            {
                float angle = Mathf.Atan2(moveDirection.y, moveDirection.x) * Mathf.Rad2Deg;
                rb.rotation = angle;
            }
        }

        rb.MovePosition(nextPos);

        if (constantSpin)
        {
            float currentRotation = rb.rotation;
            rb.rotation = currentRotation + turnSpeed * Time.fixedDeltaTime;
        }
    }

    private Vector2 GetEffectiveHalfExtents()
    {
        float angle = rb.rotation * Mathf.Deg2Rad;
        float cos = Mathf.Abs(Mathf.Cos(angle));
        float sin = Mathf.Abs(Mathf.Sin(angle));

        float width = enemyHalfExtents.x * cos + enemyHalfExtents.y * sin;
        float height = enemyHalfExtents.x * sin + enemyHalfExtents.y * cos;

        return new Vector2(width, height);
    }

    private void CheckEnemyCollisions(Vector2 currentPos, ref Vector2 direction)
    {
        GameObject[] allEnemies = GameObject.FindGameObjectsWithTag("Enemy");

        foreach (GameObject enemyObj in allEnemies)
        {
            if (enemyObj == gameObject)
                continue;

            Vector2 enemyPos = enemyObj.transform.position;
            Vector2 toOther = enemyPos - currentPos;
            float distance = toOther.magnitude;

            EnemyMovement otherEnemy = enemyObj.GetComponent<EnemyMovement>();
            float combinedDistance;

            if (otherEnemy != null)
            {
                float thisMaxExtent = Mathf.Max(enemyHalfExtents.x, enemyHalfExtents.y);
                float otherMaxExtent = Mathf.Max(otherEnemy.enemyHalfExtents.x, otherEnemy.enemyHalfExtents.y);
                combinedDistance = thisMaxExtent + otherMaxExtent;
            }
            else
            {
                float thisSize = Mathf.Max(enemyHalfExtents.x, enemyHalfExtents.y);
                combinedDistance = thisSize + 0.5f;
            }

            if (distance < combinedDistance && distance > 0.01f)
            {
                Vector2 normal = -toOther.normalized;
                direction = Vector2.Reflect(direction, normal).normalized;

                float randomAngle = Random.Range(-15f, 15f);
                direction = Rotate(direction, randomAngle).normalized;

                if (!constantSpin)
                {
                    float angle = Mathf.Atan2(direction.y, direction.x) * Mathf.Rad2Deg;
                    rb.rotation = angle;
                }

                Vector2 separation = normal * (combinedDistance - distance) * 0.5f;
                rb.MovePosition(rb.position + separation);

                break;
            }
        }
    }

    private Vector2 Rotate(Vector2 v, float degrees)
    {
        float radians = degrees * Mathf.Deg2Rad;
        float sin = Mathf.Sin(radians);
        float cos = Mathf.Cos(radians);

        return new Vector2(
            cos * v.x - sin * v.y,
            sin * v.x + cos * v.y
        );
    }
}