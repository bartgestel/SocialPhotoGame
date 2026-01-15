using UnityEngine;
using UnityEngine.UI;

public class BoneUIManager : MonoBehaviour
{
    public static BoneUIManager Instance;
    public GameObject boneIconPrefab;
    public Sprite boneBlack;
    public Sprite boneWhite;

    private Image[] boneIcons;
    private int totalBones;

    private void Awake() { Instance = this; }

    private void Start()
    {
        BonePickup[] bones = FindObjectsByType<BonePickup>(FindObjectsSortMode.None);
        totalBones = bones.Length;
        boneIcons = new Image[totalBones];

        for (int i = 0; i < totalBones; i++)
        {
            GameObject icon = Instantiate(boneIconPrefab, transform);
            Image img = icon.GetComponent<Image>();
            img.sprite = boneBlack;
            boneIcons[i] = img;
        }
    }

    public void UpdateUI(int bonesCollected)
    {
        for (int i = 0; i < boneIcons.Length; i++)
        {
            boneIcons[i].sprite = i < bonesCollected ? boneWhite : boneBlack;
        }
    }
}
