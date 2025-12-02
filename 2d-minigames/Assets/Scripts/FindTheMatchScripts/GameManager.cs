using UnityEngine;
using System.Collections.Generic;
using UnityEngine.UI;
using System.Collections;

public class GameManager : MonoBehaviour
{
	public GameObject cardPrefab;          // Card prefab with Card.cs
	public Transform cardParent;           // A grid layout group
	public List<Sprite> cardSprites;       // Sprites in pairs

	private Card firstCard, secondCard;
	private bool canFlip = true;
	private int matchedPairs = 0;

	void Start()
	{
		CreateBoard();
	}

	public bool CanFlip()
	{
		return canFlip;
	}

	void CreateBoard()
	{
		// Duplicate sprites to make pairs
		List<Sprite> fullDeck = new List<Sprite>();
		for (int i = 0; i < cardSprites.Count; i++)
		{
			fullDeck.Add(cardSprites[i]);
			fullDeck.Add(cardSprites[i]);     // Add pair
		}

		// Shuffle (Fisher-Yates)
		for (int i = 0; i < fullDeck.Count; i++)
		{
			Sprite temp = fullDeck[i];
			int rand = Random.Range(i, fullDeck.Count);
			fullDeck[i] = fullDeck[rand];
			fullDeck[rand] = temp;
		}

		// Create card objects
		for (int i = 0; i < fullDeck.Count; i++)
		{
			GameObject obj = Instantiate(cardPrefab, cardParent);
			Card card = obj.GetComponent<Card>();

			card.id = i / 2;                    // Matching ID
			card.frontSprite = fullDeck[i];
		}
	}

	public void CardFlipped(Card card)
	{
		if (firstCard == null)
		{
			firstCard = card;
		}
		else
		{
			secondCard = card;
			StartCoroutine(CheckMatch());
		}
	}

	IEnumerator CheckMatch()
	{
		canFlip = false;

		yield return new WaitForSeconds(0.7f);

		if (firstCard.frontSprite == secondCard.frontSprite)
		{
			firstCard.SetMatched();
			secondCard.SetMatched();

			matchedPairs++;

			CheckIfGameComplete();
		}
		else
		{
			firstCard.FlipCard();
			secondCard.FlipCard();
		}

		firstCard = null;
		secondCard = null;
		canFlip = true;
	}
	private void CheckIfGameComplete()
	{
		int totalPairs = cardSprites.Count;

		if (matchedPairs >= totalPairs)
		{
			Debug.Log("You WIn1");
			//if (GameCoordinatorScript.Instance != null)
			//{
			//	GameCoordinatorScript.Instance.TriggerWin();
			//}
		}
	}
}
