using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class EnemyMovement : MonoBehaviour
{
    [Header("Movement Settings")]
    public float speed = 3f;

    [Header("Boundary Settings")]
    public Vector2 minBounds = new Vector2(-8f, -4.5f);
    public Vector2 maxBounds = new Vector2(8f, 4.5f);

    [Header("Collision Settings")]
    public Vector2 enemyHalfExtents = new Vector2(0.5f, 0.5f);
    public float borderCheckDistance = 0.1f;
    public float rotationCooldown = 0.5f;
    public float minCollisionInterval = 0.2f;

    private Rigidbody2D rb;
    private Vector2 moveDirection;
    private BoxCollider2D boxCollider;
    private float lastRotationTime;
    private float lastCollisionTime;

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

        lastRotationTime = -rotationCooldown;
        lastCollisionTime = -minCollisionInterval;
    }

    private void FixedUpdate()
    {
        Vector2 currentPos = rb.position;
        Vector2 nextPos = currentPos + moveDirection * speed * Time.fixedDeltaTime;

        CheckGreenLineCollision(currentPos);

        bool hadCollision = false;
        hadCollision |= CheckBorderCollisions(currentPos, ref moveDirection, ref nextPos);

        if (CanCollide())
        {
            hadCollision |= CheckEnemyCollisions(currentPos, ref moveDirection);
        }

        if (hadCollision)
        {
            lastCollisionTime = Time.time;
        }

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

        if (bounced && CanRotate())
        {
            float randomAngle = Random.Range(-10f, 10f);
            moveDirection = Rotate(moveDirection, randomAngle).normalized;
            UpdateRotation();
            lastRotationTime = Time.time;
        }

        rb.MovePosition(nextPos);
    }

    private bool CanRotate()
    {
        return Time.time - lastRotationTime >= rotationCooldown;
    }

    private bool CanCollide()
    {
        return Time.time - lastCollisionTime >= minCollisionInterval;
    }

    private void UpdateRotation()
    {
        float angle = Mathf.Atan2(moveDirection.y, moveDirection.x) * Mathf.Rad2Deg;
        rb.rotation = angle;
    }

    private void CheckGreenLineCollision(Vector2 currentPos)
    {
        Collider2D[] hitColliders = Physics2D.OverlapBoxAll(
            currentPos,
            enemyHalfExtents * 2f,
            rb.rotation
        );

        foreach (Collider2D col in hitColliders)
        {
            if (col.gameObject == gameObject) continue;

            RedBlock redBlock = col.GetComponent<RedBlock>();
            if (redBlock != null && redBlock.isGreen)
            {
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.PlayerDied();
                }
                break;
            }
        }
    }

    private bool CheckBorderCollisions(Vector2 currentPos, ref Vector2 direction, ref Vector2 nextPos)
    {
        Vector2 effectiveHalfExtents = GetEffectiveHalfExtents();
        Vector2 checkPos = currentPos + direction * (speed * Time.fixedDeltaTime + borderCheckDistance);

        Collider2D[] hitColliders = Physics2D.OverlapBoxAll(
            checkPos,
            effectiveHalfExtents * 2.2f,
            rb.rotation
        );

        foreach (Collider2D col in hitColliders)
        {
            if (col.gameObject == gameObject) continue;
            if (!col.CompareTag("Border")) continue;

            Vector2 enemyPos = currentPos;
            Vector2 closestPoint = col.ClosestPoint(enemyPos);
            Vector2 normal = (enemyPos - closestPoint).normalized;

            if (normal.magnitude < 0.1f)
            {
                Vector2 toBorder = enemyPos - (Vector2)col.transform.position;
                if (toBorder.magnitude > 0.01f)
                {
                    normal = toBorder.normalized;
                }
                else
                {
                    normal = -direction;
                }
            }

            direction = Vector2.Reflect(direction, normal).normalized;

            if (CanRotate())
            {
                float randomAngle = Random.Range(-10f, 10f);
                direction = Rotate(direction, randomAngle).normalized;
                UpdateRotation();
                lastRotationTime = Time.time;
            }

            float maxExtent = Mathf.Max(effectiveHalfExtents.x, effectiveHalfExtents.y);
            Vector2 pushBack = normal * (maxExtent + 0.2f);
            nextPos = currentPos + pushBack;

            return true;
        }

        return false;
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

    private bool CheckEnemyCollisions(Vector2 currentPos, ref Vector2 direction)
    {
        if (!CanCollide()) return false;

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
                combinedDistance = thisMaxExtent + otherMaxExtent + 0.2f;
            }
            else
            {
                float thisSize = Mathf.Max(enemyHalfExtents.x, enemyHalfExtents.y);
                combinedDistance = thisSize + 0.7f;
            }

            if (distance < combinedDistance && distance > 0.01f)
            {
                Vector2 normal = -toOther.normalized;
                direction = Vector2.Reflect(direction, normal).normalized;

                if (CanRotate())
                {
                    float randomAngle = Random.Range(-15f, 15f);
                    direction = Rotate(direction, randomAngle).normalized;
                    UpdateRotation();
                    lastRotationTime = Time.time;
                }

                Vector2 separation = normal * (combinedDistance - distance + 0.3f);
                rb.MovePosition(rb.position + separation);

                return true;
            }
        }

        return false;
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