import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

export interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Wraps the browser Geolocation API with the error handling it actually
 * needs in practice: it silently no-ops (or throws a vague error) when the
 * page isn't a secure context (plain http:// on a LAN IP, common while
 * testing on a phone during dev — https:// or localhost is required), and
 * getCurrentPosition's error codes need mapping to distinguish "you said no"
 * from "GPS timed out" from "not supported here at all".
 */
export function useGeolocationCapture(onCapture: (coords: Coords) => void) {
  const { t } = useTranslation();
  const [locating, setLocating] = useState(false);

  function requestLocation() {
    if (!window.isSecureContext) {
      toast.error(t('setup.locationInsecureContext'));
      return;
    }
    if (!navigator.geolocation) {
      toast.error(t('setup.locationUnsupported'));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onCapture({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        toast.success(t('setup.locationCaptured'));
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error(t('setup.locationDenied'));
        } else if (error.code === error.TIMEOUT) {
          toast.error(t('setup.locationTimeout'));
        } else {
          toast.error(t('setup.locationFailed'));
        }
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  return { locating, requestLocation };
}
