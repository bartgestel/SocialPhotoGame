using UnityEngine;
using UnityEngine.UI;

public class WrapLayoutGroup : LayoutGroup
{
	public Vector2 cellSize = new Vector2(150, 200);
	public Vector2 spacing = new Vector2(10, 10);

	public override void CalculateLayoutInputHorizontal()
	{
		base.CalculateLayoutInputHorizontal();
	}

	public override void CalculateLayoutInputVertical()
	{
		float width = rectTransform.rect.width;
		if (width <= 0)
			return;

		float x = padding.left;
		float y = padding.top;
		float rowHeight = 0f;

		for (int i = 0; i < rectChildren.Count; i++)
		{
			if (x + cellSize.x > width - padding.right)
			{
				x = padding.left;
				y += rowHeight + spacing.y;
				rowHeight = 0f;
			}

			x += cellSize.x + spacing.x;
			rowHeight = Mathf.Max(rowHeight, cellSize.y);
		}

		float totalHeight = y + rowHeight + padding.bottom;

		// THIS IS WHAT SCROLLRECT NEEDS
		SetLayoutInputForAxis(totalHeight, totalHeight, -1, 1);
	}

	public override void SetLayoutHorizontal()
	{
		SetChildren();
	}

	public override void SetLayoutVertical()
	{
		SetChildren();
	}

	private void SetChildren()
	{
		float width = rectTransform.rect.width;
		if (width <= 0)
			return;

		float x = padding.left;
		float y = padding.top;
		float rowHeight = 0f;

		for (int i = 0; i < rectChildren.Count; i++)
		{
			RectTransform child = rectChildren[i];

			if (x + cellSize.x > width - padding.right)
			{
				x = padding.left;
				y += rowHeight + spacing.y;
				rowHeight = 0f;
			}

			SetChildAlongAxis(child, 0, x, cellSize.x);
			SetChildAlongAxis(child, 1, y, cellSize.y);

			x += cellSize.x + spacing.x;
			rowHeight = Mathf.Max(rowHeight, cellSize.y);
		}
	}
}
