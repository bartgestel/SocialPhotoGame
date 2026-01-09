using UnityEngine;

public class TrackGenerator : MonoBehaviour
{
    [Header("Track Pieces")]
    public GameObject startPiece;        // eerste stuk (met StartPoint + ExitPoint)
    public GameObject[] otherPieces;     // random stukken (met ExitPoint)
    public int pieceCount = 20;

    [Header("Player")]
    public CarController player;         // sleep PlayerCar hierheen

    private Vector3 nextPos;
    private Quaternion nextRot;

    void Start()
    {
        Generate();
    }

    void Generate()
    {
        // ---------- SAFETY CHECKS ----------
        if (startPiece == null)
        {
            Debug.LogError("TrackGenerator: StartPiece is NOT assigned");
            return;
        }

        if (player == null)
        {
            Debug.LogError("TrackGenerator: Player is NOT assigned");
            return;
        }

        if (otherPieces == null || otherPieces.Length == 0)
        {
            Debug.LogError("TrackGenerator: OtherPieces array is EMPTY");
            return;
        }

        for (int i = 0; i < otherPieces.Length; i++)
        {
            if (otherPieces[i] == null)
            {
                Debug.LogError("TrackGenerator: OtherPieces contains a NULL element at index " + i);
                return;
            }
        }

        // ---------- RESET ----------
        nextPos = Vector3.zero;
        nextRot = Quaternion.identity;

        // ---------- SPAWN START PIECE ----------
        GameObject first = Instantiate(startPiece, nextPos, nextRot, transform);

        Transform startPoint = first.transform.Find("StartPoint");
        Transform exitPoint = first.transform.Find("ExitPoint");

        if (startPoint == null || exitPoint == null)
        {
            Debug.LogError("TrackGenerator: StartPiece is missing StartPoint or ExitPoint");
            return;
        }

        // Zet player op start
        player.transform.position = startPoint.position;
        player.transform.rotation = startPoint.rotation;

        // Zet volgende spawn data
        nextPos = exitPoint.position;
        nextRot = exitPoint.rotation;

        // ---------- SPAWN REST VAN DE TRACK ----------
        for (int i = 0; i < pieceCount - 1; i++)
        {
            int index = Random.Range(0, otherPieces.Length);
            GameObject prefab = otherPieces[index];

  GameObject piece = Instantiate(prefab, nextPos, nextRot);


            Transform exit = piece.transform.Find("ExitPoint");
            if (exit == null)
            {
                Debug.LogError("TrackGenerator: ExitPoint missing on piece " + prefab.name);
                return;
            }

            nextPos = exit.position;
            nextRot = exit.rotation;
        }

        Debug.Log("TrackGenerator: Track generated successfully");
    }
}
