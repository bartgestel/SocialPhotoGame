using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;

public class GameManager : MonoBehaviour
{
	public GameObject cardPrefab;
	public Transform cardParent;
	public List<Sprite> cardSprites;

	[Header("Bad Cards")]
	public List<Sprite> badCardSprites;   // selectable list like normal cards
	public int badPairsToUse = 1;          // how many bad pairs this scene uses

	private Card firstCard, secondCard;
	private bool canFlip = true;
	private bool firstFlipDone = false;
	private bool gameOver = false;

	public AudioSource audioSource;
	public AudioClip flipSound;
	public AudioClip matchSound;
	public AudioClip winSound;
	public AudioClip loseSound;

	private int matchedPairs = 0;
	private int totalPairs;

	private List<Card> allCards = new List<Card>();

	[Header("UI")]
	public GameObject gameOverPanel;


	[Header("Guess Limit")]
	public int GuessLimit;
	private int GuessProcess = 0;
	[SerializeField] private TextMeshProUGUI GuessText;

	void Start()
	{
		gameOverPanel.SetActive(false);
		CreateBoard();
	}

	public bool CanFlip()
	{
		return canFlip && !gameOver;
	}

	void CreateBoard()
	{
		List<Sprite> fullDeck = new List<Sprite>();

		// NORMAL PAIRS
		foreach (Sprite sprite in cardSprites)
		{
			fullDeck.Add(sprite);
			fullDeck.Add(sprite);
		}

		totalPairs = cardSprites.Count;

		// BAD CARD PAIRS
		List<Sprite> availableBadCards = new List<Sprite>(badCardSprites);

		// Clamp to avoid errors
		int pairsToAdd = Mathf.Min(badPairsToUse, availableBadCards.Count);

		for (int i = 0; i < pairsToAdd; i++)
		{
			Sprite badSprite = availableBadCards[i];
			fullDeck.Add(badSprite);
			fullDeck.Add(badSprite);
		}


		// SHUFFLE
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

			card.frontSprite = fullDeck[i];
			card.isBadCard = badCardSprites.Contains(fullDeck[i]);

			allCards.Add(card);
		}
		Canvas.ForceUpdateCanvases();
		LayoutRebuilder.ForceRebuildLayoutImmediate(
			cardParent as RectTransform);
	}

	public void CardFlipped(Card card)
	{
		if (gameOver) return;

		// FIRST FLIP PROTECTION
		if (!firstFlipDone)
		{
			firstFlipDone = true;
			if (card.isBadCard)
				SwapBadCard(card);
		}

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

	void SwapBadCard(Card badCard)
	{
		List<Card> validCards = new List<Card>();

		foreach (Card c in allCards)
		{
			if (!c.isBadCard && !c.isMatched && c != badCard)
				validCards.Add(c);
		}

		if (validCards.Count == 0) return;

		Card swapTarget = validCards[Random.Range(0, validCards.Count)];

		Sprite tempSprite = swapTarget.frontSprite;
		swapTarget.frontSprite = badCard.frontSprite;
		badCard.frontSprite = tempSprite;

		swapTarget.isBadCard = true;
		badCard.isBadCard = false;
	}

	IEnumerator CheckMatch()
	{
		canFlip = false;

		yield return new WaitForSeconds(0.7f);

		// LOSS CONDITION
		if (firstCard.isBadCard && secondCard.isBadCard) //&& firstCard.frontSprite == secondCard.frontSprite)
		{
			GameOver();
			yield break;
		}

		// MATCH
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

		if (matchedPairs <= totalPairs && !gameOver)
		{
			GuessProcess++;
			GuessText.text = $"{GuessProcess} / {GuessLimit} Guesses";
			if (GuessProcess >= GuessLimit)
			{
				GameOver();
				yield break;
			}
		}
	}

	void GameOver()
	{
		gameOver = true;
		canFlip = false;
		if (loseSound != null)
			audioSource.PlayOneShot(loseSound);

		gameOverPanel.SetActive(true);
	}

	void CheckIfGameComplete()
	{
		if (matchedPairs >= totalPairs)
		{
			gameOver = true;
			canFlip = false;

			if (winSound != null)
				audioSource.PlayOneShot(winSound);

			if (GameCoordinatorScript.Instance != null)
			{
				GameCoordinatorScript.Instance.TriggerWin();
			}
			
		}
	}

	// BUTTON CALLBACK
	public void RestartGame()
	{
		SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
	}
}