using UnityEngine;

public class StarPiece : MonoBehaviour
{
    private SpriteRenderer spriteRenderer;
    private bool isTraced = false;
    private LineTracerManager manager;

    private void Start()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();

        manager = FindObjectOfType<LineTracerManager>();
    }

    public bool IsTraced()
    {
        return isTraced;
    }

    public void SetTraced()
    {
        if (!isTraced)
        {
            isTraced = true;
            manager.PieceTraced();
        }
    }
}