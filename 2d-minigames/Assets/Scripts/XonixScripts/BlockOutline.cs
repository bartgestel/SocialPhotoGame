using UnityEngine;

public class BlockOutline : MonoBehaviour
{
    [Header("Outline Settings")]
    [Tooltip("Color of the outline")]
    public Color outlineColor = Color.white;

    [Tooltip("Thickness of the outline")]
    public float outlineWidth = 0.05f;

    [Tooltip("Size of the block (usually 1 for 1x1 blocks)")]
    public float blockSize = 1f;

    private void Start()
    {
        DrawBorder();
    }

    private void DrawBorder()
    {
        GameObject borderObj = new GameObject("Outline");
        borderObj.transform.SetParent(transform);
        borderObj.transform.localPosition = Vector3.zero;

        LineRenderer line = borderObj.AddComponent<LineRenderer>();
        line.material = new Material(Shader.Find("Sprites/Default"));
        line.startColor = outlineColor;
        line.endColor = outlineColor;
        line.startWidth = outlineWidth;
        line.endWidth = outlineWidth;
        line.positionCount = 5;
        line.useWorldSpace = false;

        float halfSize = blockSize * 0.5f;
        line.SetPosition(0, new Vector3(-halfSize, -halfSize, 0));
        line.SetPosition(1, new Vector3(halfSize, -halfSize, 0));
        line.SetPosition(2, new Vector3(halfSize, halfSize, 0));
        line.SetPosition(3, new Vector3(-halfSize, halfSize, 0));
        line.SetPosition(4, new Vector3(-halfSize, -halfSize, 0));

        line.sortingOrder = 1; 
    }
}