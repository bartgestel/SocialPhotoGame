using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class XonixManager : MonoBehaviour
{
    public static XonixManager Instance;
    private List<RedBlock> currentTrail = new List<RedBlock>();
    public LayerMask redBlockLayer;
    public float gridSize = 1f; // Add this to match your grid size

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void RegisterGreenBlock(RedBlock block)
    {
        if (!currentTrail.Contains(block))
        {
            currentTrail.Add(block);
        }
    }

    public void CompleteTrail()
    {
        Debug.Log($"Completing trail with {currentTrail.Count} blocks");

        if (currentTrail.Count == 0) return;

        RedBlock[] allRedBlocks = FindObjectsOfType<RedBlock>();
        HashSet<RedBlock> greenBlocks = new HashSet<RedBlock>(currentTrail);

        HashSet<RedBlock> visited = new HashSet<RedBlock>();
        List<HashSet<RedBlock>> regions = new List<HashSet<RedBlock>>();

        foreach (RedBlock block in allRedBlocks)
        {
            if (!block.isGreen && !visited.Contains(block))
            {
                HashSet<RedBlock> region = new HashSet<RedBlock>();
                FloodFill(block, greenBlocks, visited, region, allRedBlocks);
                if (region.Count > 0)
                {
                    regions.Add(region);
                }
            }
        }

        // Find ALL regions that contain enemies (don't delete any of them)
        Collider2D[] enemies = GameObject.FindGameObjectsWithTag("Enemy")
            .Select(e => e.GetComponent<Collider2D>())
            .Where(c => c != null)
            .ToArray();

        HashSet<HashSet<RedBlock>> regionsWithEnemies = new HashSet<HashSet<RedBlock>>();

        foreach (var region in regions)
        {
            bool hasEnemy = false;
            foreach (var block in region)
            {
                // Use OverlapCircle to check for enemies near this block
                Collider2D[] nearbyColliders = Physics2D.OverlapCircleAll(
                    block.transform.position,
                    gridSize * 0.6f // Check within 60% of grid size radius
                );

                foreach (var col in nearbyColliders)
                {
                    if (col.CompareTag("Enemy"))
                    {
                        regionsWithEnemies.Add(region);
                        hasEnemy = true;
                        Debug.Log($"Region contains enemy at {col.transform.position} near block at {block.transform.position}");
                        break;
                    }
                }
                if (hasEnemy) break;
            }
        }

        Debug.Log($"Found {regions.Count} regions, {regionsWithEnemies.Count} contain enemies");

        // Delete all regions that DON'T contain enemies
        foreach (var region in regions)
        {
            if (!regionsWithEnemies.Contains(region))
            {
                Debug.Log($"Deleting region with {region.Count} blocks");
                foreach (var block in region)
                {
                    if (block != null)
                    {
                        Destroy(block.gameObject);
                    }
                }
            }
            else
            {
                Debug.Log($"Keeping region with {region.Count} blocks (has enemy)");
            }
        }

        // Delete the green trail blocks
        foreach (RedBlock red in currentTrail)
        {
            if (red != null)
            {
                Destroy(red.gameObject);
            }
        }

        currentTrail.Clear();
    }

    private void FloodFill(RedBlock start, HashSet<RedBlock> greenBlocks, HashSet<RedBlock> visited, HashSet<RedBlock> region, RedBlock[] allBlocks)
    {
        if (start == null || visited.Contains(start) || greenBlocks.Contains(start))
            return;

        visited.Add(start);
        region.Add(start);

        Vector3[] directions = {
            Vector3.up,
            Vector3.down,
            Vector3.left,
            Vector3.right
        };

        foreach (var dir in directions)
        {
            Vector3 checkPos = start.transform.position + dir * gridSize;

            foreach (var block in allBlocks)
            {
                if (Vector3.Distance(block.transform.position, checkPos) < 0.1f)
                {
                    FloodFill(block, greenBlocks, visited, region, allBlocks);
                    break;
                }
            }
        }
    }

    public void ResetTrail()
    {
        Debug.Log($"Resetting trail with {currentTrail.Count} blocks");

        foreach (RedBlock red in currentTrail)
        {
            if (red != null)
                red.ResetRed();
        }
        currentTrail.Clear();
    }
}