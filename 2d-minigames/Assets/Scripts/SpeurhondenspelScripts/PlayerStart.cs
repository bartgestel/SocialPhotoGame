using UnityEngine;

public class PlayerStart : MonoBehaviour
{
    private void Start()
    {
        if (SpeurhondenManager.Instance != null)
        {
            SpeurhondenManager.Instance.SetCheckpoint(transform.position);
        }
    }
}