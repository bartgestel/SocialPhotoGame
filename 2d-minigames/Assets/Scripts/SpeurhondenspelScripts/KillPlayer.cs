using UnityEngine;

public class KillPlayer : MonoBehaviour
{
    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            Destroy(other.gameObject);
            SpeurhondenManager.Instance.PlayerDied();
            Debug.Log("Player died!");
        }
    }
}