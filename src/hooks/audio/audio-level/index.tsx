import { useEffect, useState } from "react";
import monitorAudioLevel from "./utils";

export default function useAudioLevel(mediaStreamTrack?: MediaStreamTrack) {
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!mediaStreamTrack) return;
    const cancel = monitorAudioLevel({
      onMeasure: (v) => setAudioLevel(Math.round(v * 100) / 100),
      mediaStreamTrack,
    });

    return () => {
      cancel();
    };
  }, [mediaStreamTrack]);

  return Math.min(1, audioLevel * 3);
}
