using UnityEngine;

public class BonePickup : MonoBehaviour
{
    private void OnTriggerEnter2D(Collider2D other)
    {
        if (!other.CompareTag("Player")) return;
        SpeurhondenManager.Instance.CollectBone();
        Destroy(gameObject);
    }
}
