using UnityEngine;
using UnityEngine.InputSystem;

public class LineTracerManager : MonoBehaviour
{
    [Header("Game Settings")]
    public float allowedDistance = 0.5f;
    public GameObject starContainer;

    private Camera mainCamera;
    private bool isDrawing = false;
    private bool gameOver = false;
    private StarPiece[] allPieces;
    private int totalPieces;
    private int tracedPieces = 0;

    private void Start()
    {
        mainCamera = Camera.main;
        allPieces = starContainer.GetComponentsInChildren<StarPiece>();
        totalPieces = allPieces.Length;

        Debug.Log($"Line Tracer started with {totalPieces} pieces");
    }

    private void Update()
    {
        if (gameOver) return;

        Vector2 mousePos = mainCamera.ScreenToWorldPoint(Mouse.current.position.ReadValue());

        if (Mouse.current.leftButton.wasPressedThisFrame)
        {
            isDrawing = true;
            Debug.Log("Started drawing");
        }

        if (Mouse.current.leftButton.isPressed && isDrawing)
        {
            CheckMousePosition(mousePos);
        }

        // NIEUWE REGEL: Als speler stopt met klikken = automatisch game over
        if (Mouse.current.leftButton.wasReleasedThisFrame)
        {
            if (tracedPieces < totalPieces)
            {
                Debug.Log("Released mouse before completing - GAME OVER");
                GameOver();
            }
            isDrawing = false;
        }
    }

    private void CheckMousePosition(Vector2 mousePos)
    {
        Collider2D hit = Physics2D.OverlapPoint(mousePos);

        if (hit != null)
        {
            StarPiece piece = hit.GetComponent<StarPiece>();

            if (piece != null)
            {
                piece.SetTraced();
            }
            else
            {
                GameOver();
            }
        }
        else
        {
            float closestDistance = GetClosestDistanceToStar(mousePos);

            if (closestDistance > allowedDistance)
            {
                GameOver();
            }
        }
    }

    private float GetClosestDistanceToStar(Vector2 mousePos)
    {
        float closestDistance = float.MaxValue;

        foreach (StarPiece piece in allPieces)
        {
            float distance = Vector2.Distance(mousePos, piece.transform.position);
            if (distance < closestDistance)
            {
                closestDistance = distance;
            }
        }

        return closestDistance;
    }

    public void PieceTraced()
    {
        tracedPieces++;

        if (tracedPieces >= totalPieces)
        {
            Victory();
        }
    }

    private void Victory()
    {
        gameOver = true;
        Debug.Log(" YOU WIN! Star completely traced! ");
    }

    private void GameOver()
    {
        if (gameOver) return;

        gameOver = true;
        isDrawing = false;

        Debug.Log(" GAME OVER! You went outside the lines! ");
    }
}