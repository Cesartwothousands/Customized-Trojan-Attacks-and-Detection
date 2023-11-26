package trojanand.server.model;

public class ImageModel {
    private final String name;
    private final String mimeType;

    public ImageModel(String name, String mimeType) {
        this.name = name;
        this.mimeType = mimeType;
    }

    public String getName() {
        return name;
    }

    public String getMimeType() {
        return mimeType;
    }
}
