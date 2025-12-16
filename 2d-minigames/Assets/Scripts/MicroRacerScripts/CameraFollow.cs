using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    public Transform target;      // PlayerCar
    public float smoothSpeed = 5f;
    public Vector3 offset;        // afstand tussen camera en auto

    void LateUpdate()
    {
        if (target == null) return;

        // Doelpositie
        Vector3 desiredPos = target.position + offset;

        // Smooth movement
        Vector3 smoothedPos = Vector3.Lerp(transform.position, desiredPos, smoothSpeed * Time.deltaTime);

        // Camera verplaatsen
        transform.position = smoothedPos;

        // Zorg dat camera niet draait
        transform.rotation = Quaternion.identity;
    }
}
