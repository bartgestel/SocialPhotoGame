using UnityEngine;

public class PushTrigger : MonoBehaviour
{
    public Vector2 pushDirection;
    private Pushable pushableParent;
    private bool playerInside = false;

    private void Awake()
    {
        pushableParent = GetComponentInParent<Pushable>();
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
            playerInside = true;
    }

    private void OnTriggerExit2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
            playerInside = false;
    }

    private void FixedUpdate()
    {
        if (playerInside)
            pushableParent.Push(pushDirection); 
    }

}
