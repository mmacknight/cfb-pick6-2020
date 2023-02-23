import { Platform } from '@ionic/angular';

export function getDevice(platform: Platform) {
    if (platform.is('ios') || platform.is('android')) {
      return "phone";
    } else {
      return "desktop";
    }
};
