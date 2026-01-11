using UnityEngine;

public class TrackManager : MonoBehaviour
{
    public GameObject trackPrefab;

    void Start()
    {
        if (trackPrefab == null)
        {
            Debug.LogError("no track prefab assigned");
            return;
        }

        // spawn the track in the scene
        GameObject track = Instantiate(trackPrefab);

        // big random rotation in 90 degree steps
        int[] rotations = { 0, 32, 41, 56, 80, 90, 100, 123, 156, 180, 213, 247, 270 };
        int randomRotation = rotations[Random.Range(0, rotations.Length)];

        track.transform.rotation = Quaternion.Euler(0, 0, randomRotation);
    }
}
