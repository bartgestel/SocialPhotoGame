using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class XonixManager : MonoBehaviour
{
    public static XonixManager Instance;
    private List<RedBlock> currentTrail = new List<RedBlock>();
    public LayerMask redBlockLayer; 

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

        // Find which region contains enemies (don't delete that one)
        Collider2D[] enemies = GameObject.FindGameObjectsWithTag("Enemy")
            .Select(e => e.GetComponent<Collider2D>())
            .Where(c => c != null)
            .ToArray();

        HashSet<RedBlock> regionWithEnemies = null;

        foreach (var region in regions)
        {
            foreach (var block in region)
            {
                foreach (var enemy in enemies)
                {
                    if (Vector2.Distance(block.transform.position, enemy.transform.position) < 0.5f)
                    {
                        regionWithEnemies = region;
                        break;
                    }
                }
                if (regionWithEnemies != null) break;
            }
            if (regionWithEnemies != null) break;
        }

        foreach (var region in regions)
        {
            if (region != regionWithEnemies)
            {
                foreach (var block in region)
                {
                    if (block != null)
                    {
                        Destroy(block.gameObject);
                    }
                }
            }
        }

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
            Vector3 checkPos = start.transform.position + dir;

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