using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class Card : MonoBehaviour
{
	public int id;                        // The card's matching ID
	public Image cardImage;               // The UI image component
	public Sprite frontSprite;            // The assigned sprite
	public Sprite backSprite;             // The card back visual

	private bool isFlipped = false;
	private bool isMatched = false;

	private GameManager gameManager;

	void Start()
	{
		gameManager = FindObjectOfType<GameManager>();
		cardImage.sprite = backSprite;    // Start face down
	}

	public void OnClick()
	{
		if (isFlipped || isMatched || !gameManager.CanFlip())
			return;

		FlipCard();
		gameManager.CardFlipped(this);
	}

	public void FlipCard()
	{
		isFlipped = !isFlipped;
		cardImage.sprite = isFlipped ? frontSprite : backSprite;
	}

	public void SetMatched()
	{
		isMatched = true;
	}
}