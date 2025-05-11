import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export async function shareFileAsync(fileUri) {
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) {
      throw new Error('File does not exist.');
    }
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('Sharing is not available on this device.');
    }
    await Sharing.shareAsync(fileUri);
    return true;
  } catch (e) {
    return false;
  }
}
