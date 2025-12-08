using UnityEngine;
using System.Collections.Generic;
using UnityEngine.UI;
using System.Collections;

public class GameManager : MonoBehaviour
{
	public GameObject cardPrefab;
	public Transform cardParent;
	public List<Sprite> cardSprites;       // normal sprites (each appears once)

	public Sprite badCardSprite;           // Sprite for bad cards (same image for both)

	private Card firstCard, secondCard;
	private bool canFlip = true;

	public AudioSource audioSource;
	public AudioClip flipSound;
	public AudioClip matchSound;
	public AudioClip winSound;
	public AudioClip loseSound;

	private int matchedPairs = 0;
	private int totalPairs;

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
		List<Sprite> fullDeck = new List<Sprite>();

		// NORMAL CARD PAIRS
		for (int i = 0; i < cardSprites.Count; i++)
		{
			fullDeck.Add(cardSprites[i]);
			fullDeck.Add(cardSprites[i]);
		}

		totalPairs = cardSprites.Count; // used for win detection

		// BAD CARD PAIR (2 cards)
		fullDeck.Add(badCardSprite);
		fullDeck.Add(badCardSprite);

		// SHUFFLE DECK
		for (int i = 0; i < fullDeck.Count; i++)
		{
			Sprite temp = fullDeck[i];
			int rand = Random.Range(i, fullDeck.Count);
			fullDeck[i] = fullDeck[rand];
			fullDeck[rand] = temp;
		}

		// CREATE CARDS
		for (int i = 0; i < fullDeck.Count; i++)
		{
			GameObject obj = Instantiate(cardPrefab, cardParent);
			Card card = obj.GetComponent<Card>();

			// Assign front sprite
			card.frontSprite = fullDeck[i];

			// Detect if this is a bad card
			if (fullDeck[i] == badCardSprite)
			{
				card.isBadCard = true;
			}

			card.id = i / 2;
		}
	}

	public void CardFlipped(Card card)
	{
		if (flipSound != null)
			audioSource.PlayOneShot(flipSound);

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

		// BAD CARD CHECK
		if (firstCard.isBadCard && secondCard.isBadCard)
		{
			Debug.Log("BAD CARDS MATCHED — YOU LOSE");

			if (loseSound != null)
				audioSource.PlayOneShot(loseSound);

			yield break;
		}

		// NORMAL MATCH CHECK
		if (firstCard.frontSprite == secondCard.frontSprite)
		{
			firstCard.SetMatched();
			secondCard.SetMatched();

			if (matchSound != null)
				audioSource.PlayOneShot(matchSound);

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
		if (matchedPairs >= totalPairs)
		{
			Debug.Log("Yyo Win1");
			
			//if (GameCoordinatorScript.Instance != null)
			//{
			//	GameCoordinatorScript.Instance.TriggerWin();
			//}

			if (winSound != null)
				audioSource.PlayOneShot(winSound);
		}
	}
}

