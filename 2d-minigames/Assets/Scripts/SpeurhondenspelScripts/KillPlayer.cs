using UnityEngine;
using UnityEngine.Audio;

public class KillPlayer : MonoBehaviour
{
    [SerializeField] private AudioClip deathMusic;
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
            if (musicAudioSource != null)
            {
                musicAudioSource.Stop();
            }

            if (deathMusic != null && audioSource != null)
            {
                audioSource.PlayOneShot(deathMusic);
            }
            
            other.GetComponent<PlayerController>().ResetMovement();
            SpeurhondenManager.Instance.PlayerDied();
        }

    }
}