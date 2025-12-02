using UnityEngine;

public class EnemyPath : MonoBehaviour
{
    public Transform[] waypoints;
    public float speed = 2f;

    private int index = 0;
    private int direction = 1; // 1 = forward, -1 = backward

    void Update()
    {
        if (waypoints.Length == 0) return;

        // Move towards the current waypoint
        transform.position = Vector2.MoveTowards(transform.position,
            waypoints[index].position, speed * Time.deltaTime);

        // Check if reached the waypoint
        if (Vector2.Distance(transform.position, waypoints[index].position) < 0.1f)
        {
            // Change index based on direction
            index += direction;

            // If we reach the ends, reverse direction
            if (index >= waypoints.Length - 1 || index <= 0)
            {
                direction *= -1; // Reverse direction
            }
        }
    }
}
