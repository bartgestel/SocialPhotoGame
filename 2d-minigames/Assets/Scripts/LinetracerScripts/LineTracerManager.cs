using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;

public class LineTracerManager : MonoBehaviour
{
    [Header("Game Settings")]
    public float allowedDistance = 0.5f;
    public GameObject starContainer;

    [Header("Line Visual")]
    public LineRenderer lineRenderer;
    private List<Vector3> linePositions = new List<Vector3>();

    [Header("Cookie Settings")]
    public GameObject cookie;
    public GameObject brokenCookiePrefab;

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

    }

    private void Update()
    {
        if (gameOver) return;

        Vector2 mousePos = mainCamera.ScreenToWorldPoint(Mouse.current.position.ReadValue());

        if (Mouse.current.leftButton.wasPressedThisFrame)
        {
            isDrawing = true;
            linePositions.Clear();

            if (lineRenderer != null)
            {
                lineRenderer.positionCount = 0;
            }
        }

        if (Mouse.current.leftButton.isPressed && isDrawing)
        {
            CheckMousePosition(mousePos);
            UpdateLine(mousePos);
        }

        if (Mouse.current.leftButton.wasReleasedThisFrame)
        {
            if (tracedPieces < totalPieces)
            {
                GameOver();
            }

            isDrawing = false;

            if (lineRenderer != null)
            {
                lineRenderer.positionCount = 0;
                linePositions.Clear();
            }
        }
    }

    private void UpdateLine(Vector2 mousePos)
    {
        if (lineRenderer == null) return;

        Vector3 pos = new Vector3(mousePos.x, mousePos.y, 0);

        if (linePositions.Count == 0 ||
            Vector3.Distance(pos, linePositions[linePositions.Count - 1]) > 0.05f)
        {
            linePositions.Add(pos);
            lineRenderer.positionCount = linePositions.Count;
            lineRenderer.SetPositions(linePositions.ToArray());
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
        float closest = float.MaxValue;

        foreach (StarPiece piece in allPieces)
        {
            float dist = Vector2.Distance(mousePos, piece.transform.position);
            if (dist < closest) closest = dist;
        }

        return closest;
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

        if (lineRenderer != null)
        {
            lineRenderer.positionCount = 0;
            linePositions.Clear();
        }

        if (cookie != null && brokenCookiePrefab != null)
        {
            Vector3 pos = cookie.transform.position;
            Quaternion rot = cookie.transform.rotation;

            Destroy(cookie);
            Instantiate(brokenCookiePrefab, pos, rot);
        }
    }
}