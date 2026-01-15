using UnityEngine;

public class MobileJoystickAdapter : MonoBehaviour
{
    public Joystick joystick;
    public PlayerController playerController;
    public float inputThreshold = 0.5f;

    void Start()
    {
        joystick.gameObject.SetActive(Application.isMobilePlatform);
    }

    void Update()
    {
        Vector2 input = new Vector2(joystick.Horizontal, joystick.Vertical);

        if (input.magnitude < inputThreshold)
            input = Vector2.zero;

        if (input != Vector2.zero && !playerController.IsMovingPublic())
        {
            playerController.MoveWithJoystick(input);
        }
    }
}
