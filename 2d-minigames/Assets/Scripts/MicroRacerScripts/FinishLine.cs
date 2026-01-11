using UnityEngine;

public class FinishLine : MonoBehaviour
{
    private bool canFinish = false; // only true after player leaves once

    private void OnTriggerExit2D(Collider2D col)
    {
        if (col.CompareTag("Player"))
        {
            // player has left the finish area, now finishing is allowed
            canFinish = true;
        }
    }

    private void OnTriggerEnter2D(Collider2D col)
    {
        if (!col.CompareTag("Player")) return;

        if (!canFinish)
        {
            // spawned on it / still inside it, ignore
            return;
        }

        // valid finish
        CarController car = col.GetComponent<CarController>();
        if (car != null)
        {
            car.FinishRace(); // we’ll make this public in CarController
        }
    }

    // Call this when the player respawns so they don't insta-win
    public void ResetFinishGate()
    {
        canFinish = false;
    }
}
