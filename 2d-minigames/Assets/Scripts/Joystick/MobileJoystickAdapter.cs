using UnityEngine;

public class MobileJoystickAdapter : MonoBehaviour
{
    public Joystick joystick;
    public MonoBehaviour controlledPlayer; 
    private IMobileControllable player;
    public float inputThreshold = 0.5f;

    void Awake()
    {
        player = controlledPlayer as IMobileControllable;
        if (player == null)
        {
            Debug.LogError("Controlled player does not implement IMobileControllable!");
        }
    }

    void Start()
    {
        joystick.gameObject.SetActive(Application.isMobilePlatform);
    }
    void Update()
    {
        if (player == null) return;

        Vector2 input = new Vector2(joystick.Horizontal, joystick.Vertical);

        if (input.magnitude < inputThreshold)
            input = Vector2.zero;

        if (input != Vector2.zero && !player.IsMoving())
        {
            player.Move(input);
        }
    }
}
