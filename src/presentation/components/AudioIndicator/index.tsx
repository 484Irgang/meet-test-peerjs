import useAudioLevel from "@/hooks/audio/audio-level";
import { FC } from "react";
type AudioIndicatorProps = {
  audioTrack: MediaStreamTrack | undefined;
};

export const AudioIndicator: FC<AudioIndicatorProps> = ({ audioTrack }) => {
  const audioLevel = useAudioLevel(audioTrack);
  const minSize = 0.6;
  const scaleModifier = 0.8;
  return (
    <div
      className="h-4 w-4 rounded-all bg-brand-500 flex items-center justify-center"
      style={{
        scale: Math.max(minSize, audioLevel + scaleModifier),
      }}
    >
      <div className="h-2 w-2 rounded-all bg-brand-200" />
    </div>
  );
};
