using UnityEngine;

public class ResettableObject : MonoBehaviour
{
    public Transform resetPoint; 

    private void Start()
    {
        Debug.Log($"ResettableObject '{gameObject.name}' started. Reset point assigned: {(resetPoint != null ? resetPoint.name : "NONE")}");
    }

    public void ResetPosition()
    {
        Debug.Log($"ResetPosition called on '{gameObject.name}'");

        if (resetPoint != null)
        {
            Debug.Log($"Moving '{gameObject.name}' from {transform.position} to {resetPoint.position}");
            transform.position = resetPoint.position;
            Debug.Log($"New position: {transform.position}");
        }
        else
        {
            Debug.LogError($"Reset point is NULL on '{gameObject.name}'! Drag the empty GameObject into the Inspector.");
        }
    }
}