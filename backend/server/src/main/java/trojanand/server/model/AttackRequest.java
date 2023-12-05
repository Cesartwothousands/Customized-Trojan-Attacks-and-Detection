package trojanand.server.model;

public class AttackRequest {
    public int x;
    public int y;
    public int height;
    public int width;
    public float alpha;

    public AttackRequest(int x, int y, int height, int width, float alpha) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.alpha = alpha;
    }
}
