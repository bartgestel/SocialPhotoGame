using UnityEngine;

public class EndLevel : MonoBehaviour
{
    [SerializeField] private AudioClip levelCompleteMusic;
    [SerializeField] private AudioSource musicAudioSource; 

    private AudioSource audioSource;

    private void Awake()
    {
        audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            BonePickup[] remainingBones = Object.FindObjectsByType<BonePickup>(FindObjectsSortMode.None);
            if (remainingBones.Length == 0)
            {
                Debug.Log("Level completed! All bones collected.");

                // Stop background music
                if (musicAudioSource != null)
                {
                    musicAudioSource.Stop();
                }

                // Play level complete music
                if (levelCompleteMusic != null && audioSource != null)
                {
                    audioSource.PlayOneShot(levelCompleteMusic);
                }

                if (GameCoordinatorScript.Instance != null)
                {
                    GameCoordinatorScript.Instance.TriggerWin();
                }
            }
            else
            {
                Debug.Log("You still need to collect all the bones!");
            }
        }
    }
}