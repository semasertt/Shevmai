import * as ImagePicker from "expo-image-picker";

/**
 * Kamera + galeri izinlerini iste
 */
export async function requestImagePermissions() {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const gallery = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (camera.status !== "granted" || gallery.status !== "granted") {
        throw new Error("Kamera ve galeri izinleri verilmedi!");
    }
}

/**
 * Galeriden fotoğraf seç
 */
export async function pickImageFromGallery() {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
    });

    if (!result.canceled) {
        return result.assets[0]; // { uri, base64, width, height }
    }
    return null;
}

/**
 * Kameradan fotoğraf çek
 */
export async function takePhotoWithCamera() {
    let result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.7,
    });

    if (!result.canceled) {
        return result.assets[0];
    }
    return null;
}
