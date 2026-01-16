using UnityEngine;

public interface IMobileControllable
{
    bool IsMoving();
    void Move(Vector2 direction);
}
