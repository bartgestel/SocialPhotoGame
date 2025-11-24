using UnityEngine;

public class EndLevel : MonoBehaviour
{
    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            BonePickup[] remainingBones = Object.FindObjectsByType<BonePickup>(FindObjectsSortMode.None);

            if (remainingBones.Length == 0)
            {
                Debug.Log("Level completed! All bones collected.");
            }
            else
            {
                Debug.Log("You still need to collect all the bones!");
            }
        }
    }
}
