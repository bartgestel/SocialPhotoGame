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
	
	public int puzzleGridSize = 3;         // Grid size for puzzle pieces (3x3, 4x4, etc.)
	public int maxPiecesToUse = 5;         // Max number of unique pieces to use (7 pairs + 2 bad = 16 cards)

	private Card firstCard, secondCard;
	private bool canFlip = true;

	public AudioSource audioSource;
	public AudioClip flipSound;
	public AudioClip matchSound;
	public AudioClip winSound;
	public AudioClip loseSound;

	private int matchedPairs = 0;
	private int totalPairs;
	
	private bool usingPuzzlePieces = false;

	void Start()
	{
		LoadPuzzlePiecesIfNeeded();
	}
	
	private void LoadPuzzlePiecesIfNeeded()
	{
		// Check if GameCoordinator has a pictureId (meaning this is a puzzle game)
		if (GameCoordinatorScript.Instance != null)
		{
			string pictureId = PlayerPrefs.GetString("CurrentPictureId", "");
			
			if (!string.IsNullOrEmpty(pictureId))
			{
				Debug.Log($"Loading puzzle pieces for FindTheMatch game: {pictureId}");
				usingPuzzlePieces = true;
				
				PuzzlePieceLoader loader = gameObject.AddComponent<PuzzlePieceLoader>();
				
				// Set consistent pixel size for all pieces
				loader.targetPixelWidth = 256;
				loader.targetPixelHeight = 256;
				loader.pixelsPerUnit = 100f;
				
				loader.LoadPuzzlePieces(pictureId, puzzleGridSize, OnPuzzlePiecesLoaded);
			}
			else
			{
				// No puzzle pieces, use default sprites
				CreateBoard();
			}
		}
		else
		{
			CreateBoard();
		}
	}
	
	private void OnPuzzlePiecesLoaded(Sprite[] pieces, PuzzleResponse puzzleData)
	{
		if (pieces == null || pieces.Length == 0)
		{
			Debug.LogWarning("No puzzle pieces loaded, using default sprites");
			CreateBoard();
			return;
		}

		Debug.Log($"Successfully loaded {pieces.Length} puzzle pieces for matching game");
		
		// Clear cardSprites to ensure we start fresh
		cardSprites.Clear();
		
		// Randomly select only the pieces we need
		List<Sprite> allPieces = new List<Sprite>(pieces);
		
		// Shuffle and take only maxPiecesToUse
		for (int i = 0; i < allPieces.Count; i++)
		{
			int rand = Random.Range(i, allPieces.Count);
			Sprite temp = allPieces[i];
			allPieces[i] = allPieces[rand];
			allPieces[rand] = temp;
		}
		
		int piecesToTake = Mathf.Min(maxPiecesToUse, allPieces.Count);
		Debug.Log($"Taking {piecesToTake} pieces from {allPieces.Count} available pieces");
		
		for (int i = 0; i < piecesToTake; i++)
		{
			cardSprites.Add(allPieces[i]);
		}
		
		Debug.Log($"Using {cardSprites.Count} puzzle pieces for the game (+ 2 bad cards = {cardSprites.Count * 2 + 2} total cards)");
		
		CreateBoard();
	}

	public bool CanFlip()
	{
		return canFlip;
	}

	void CreateBoard()
	{
		// Clear any existing cards first
		foreach (Transform child in cardParent)
		{
			Destroy(child.gameObject);
		}
		
		Debug.Log($"CreateBoard called with {cardSprites.Count} unique sprites");
		
		List<Sprite> fullDeck = new List<Sprite>();

		// NORMAL CARD PAIRS
		for (int i = 0; i < cardSprites.Count; i++)
		{
			fullDeck.Add(cardSprites[i]);
			fullDeck.Add(cardSprites[i]);
		}

		totalPairs = cardSprites.Count; // used for win detection

		// BAD CARD PAIR (2 cards)
		if (badCardSprite != null)
		{
			fullDeck.Add(badCardSprite);
			fullDeck.Add(badCardSprite);
		}
		
		Debug.Log($"Total deck size: {fullDeck.Count} cards ({totalPairs} pairs + {(badCardSprite != null ? 2 : 0)} bad cards)");

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
			Debug.Log("BAD CARDS MATCHED � YOU LOSE");

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
			Debug.Log("You Win!");
			
			if (GameCoordinatorScript.Instance != null)
			{
				GameCoordinatorScript.Instance.TriggerWin();
			}

			if (winSound != null)
				audioSource.PlayOneShot(winSound);
		}
	}
}

