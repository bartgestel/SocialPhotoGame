using UnityEngine;

[RequireComponent(typeof(Animator))]
[RequireComponent(typeof(SpriteRenderer))]
public class EnemyPath : MonoBehaviour
{
    public Transform[] waypoints;
    public float speed = 2f;

    private int index = 0;

    private Animator animator;
    private SpriteRenderer spriteRenderer;

    private void Awake()
    {
        animator = GetComponent<Animator>();
        spriteRenderer = GetComponent<SpriteRenderer>();

        animator.speed = 1f;
    }

    private void Update()
    {
        if (waypoints.Length == 0) return;

        Vector2 target = waypoints[index].position;
        Vector2 current = transform.position;

        Vector2 moveDir = target - current;

        if (moveDir.x < 0)
            spriteRenderer.flipX = true;
        else if (moveDir.x > 0)
            spriteRenderer.flipX = false;

        transform.position = Vector2.MoveTowards(current, target, speed * Time.deltaTime);

        if (Vector2.Distance(current, target) < 0.1f)
        {
            index++;

            if (index >= waypoints.Length)
            {
                index = 0;
            }
        }
    }
}
