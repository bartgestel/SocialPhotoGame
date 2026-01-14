using System.Collections.Generic;
using UnityEngine;

public class RedBlock : MonoBehaviour
{
    private SpriteRenderer sr;
    public bool isGreen = false;

    private void Awake()
    {
        sr = GetComponent<SpriteRenderer>();
    }

    public void TurnGreen()
    {
        if (sr == null || isGreen) return;

        sr.color = Color.green;
        isGreen = true;

        XonixManager.Instance.RegisterGreenBlock(this);
    }

    public void ResetRed()
    {
        if (sr == null) return;
        sr.color = Color.white;
        isGreen = false;
    }
}
