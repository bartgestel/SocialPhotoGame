using UnityEngine;
using UnityEngine.InputSystem;

public class CheckButton : MonoBehaviour
{
    [Header("Connection Check Settings")]
    public float connectionCheckRadius = 0.2f;
    public string triggerTag = "PipeTrigger"; // Geef alle triggers deze tag

    private Camera mainCamera;
    private Collider2D buttonCollider;

    private void Start()
    {
        mainCamera = Camera.main;
        buttonCollider = GetComponent<Collider2D>();
    }

    private void Update()
    {
        if (Mouse.current.leftButton.wasPressedThisFrame)
        {
            Vector2 mousePos = mainCamera.ScreenToWorldPoint(Mouse.current.position.ReadValue());

            if (buttonCollider.OverlapPoint(mousePos))
            {
                CheckAllTriggerConnections();
            }
        }
    }

    private void CheckAllTriggerConnections()
    {
        Debug.Log("=== CHECKING ALL TRIGGER CONNECTIONS ===");

        // Vind alle triggers in de scene
        GameObject[] allTriggers = GameObject.FindGameObjectsWithTag(triggerTag);

        if (allTriggers.Length == 0)
        {
            Debug.LogError("No triggers found! Make sure all triggers have the tag '" + triggerTag + "'");
            return;
        }

        Debug.Log($"Found {allTriggers.Length} triggers to check");

        int connectedCount = 0;
        int disconnectedCount = 0;

        foreach (GameObject triggerObj in allTriggers)
        {
            Collider2D trigger = triggerObj.GetComponent<Collider2D>();
            if (trigger == null) continue;

            Vector2 triggerPosition = trigger.bounds.center;

            // Check of deze trigger overlapt met een andere trigger
            Collider2D[] overlapping = Physics2D.OverlapCircleAll(triggerPosition, connectionCheckRadius);

            bool hasConnection = false;

            foreach (Collider2D other in overlapping)
            {
                // Skip jezelf
                if (other == trigger) continue;

                // Check of het ook een trigger is met de juiste tag
                if (other.CompareTag(triggerTag))
                {
                    // Check of ze van verschillende pipes zijn
                    if (other.transform.parent != trigger.transform.parent)
                    {
                        hasConnection = true;
                        Debug.Log($" Trigger '{triggerObj.name}' is connected to '{other.gameObject.name}'");
                        break;
                    }
                }
            }

            if (hasConnection)
            {
                connectedCount++;
            }
            else
            {
                disconnectedCount++;
                Debug.LogWarning($" Trigger '{triggerObj.name}' has NO connection!");
            }
        }

        // Resultaat
        Debug.Log($"=== RESULTS ===");
        Debug.Log($"Connected: {connectedCount}/{allTriggers.Length}");
        Debug.Log($"Disconnected: {disconnectedCount}/{allTriggers.Length}");

        if (disconnectedCount == 0)
        {
            Debug.Log(" SUCCESS! All triggers are properly connected! ");
        }
        else
        {
            Debug.LogError($" FAILED! {disconnectedCount} trigger(s) are not connected! ");
        }
    }

    // Visualiseer check radius in editor
    private void OnDrawGizmos()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, 0.5f);
    }
}