using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class Card : MonoBehaviour
{
	public int id;
	public Image cardImage;
	public Sprite frontSprite;
	public Sprite backSprite;

	private bool isFlipped = false;
	public bool isMatched = false;

	private GameManager gameManager;

	public bool isBadCard = false;

	void Start()
	{
		gameManager = FindObjectOfType<GameManager>();
		cardImage.sprite = backSprite;    // Start face down
	}

	// This is called from your Button OnClick()
	public void OnClick()
	{
		if (isFlipped || isMatched || !gameManager.CanFlip())
			return;

		FlipCard();
		gameManager.CardFlipped(this);
	}

	// Start the flip animation
	public void FlipCard()
	{
		StartCoroutine(FlipAnimation());
	}

	private IEnumerator FlipAnimation()
	{
		float duration = 0.15f;  // Speed of half-flip
		float t = 0;

		// Start scale (normal)
		Vector3 startScale = transform.localScale;

		// Scale at the midpoint (invisible)
		Vector3 midScale = new Vector3(0f, startScale.y, startScale.z);

		// Step 1 — shrink X scale to 0
		while (t < duration)
		{
			transform.localScale = Vector3.Lerp(startScale, midScale, t / duration);
			t += Time.deltaTime;
			yield return null;
		}
		transform.localScale = midScale;

		// Swap sprite when card is "invisible"
		isFlipped = !isFlipped;
		cardImage.sprite = isFlipped ? frontSprite : backSprite;

		// Step 2 — expand X scale back to 1
		t = 0;
		Vector3 endScale = startScale;

		while (t < duration)
		{
			transform.localScale = Vector3.Lerp(midScale, endScale, t / duration);
			t += Time.deltaTime;
			yield return null;
		}
		transform.localScale = endScale;
	}

	public void SetMatched()
	{
		isMatched = true;
	}
}
