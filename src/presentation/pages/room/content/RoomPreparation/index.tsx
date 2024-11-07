import useAudioLevel from "@/hooks/audio/audio-level";
import { MediaStreamView } from "@/presentation/components/MediaStreamView";
import { useLocalStreamStore } from "@/store/local-stream";
import { Room } from "@/types/room";
import { FC, useState } from "react";
import {
  FaCopy,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

export const RoomPreparation = ({ room }: { room: Room }) => {
  const [roomIdCopied, setRoomIdCopied] = useState(false);

  const {
    mutated,
    toggleMutated,
    videoStreamTracks,
    audioStreamTracks,
    showCamera,
    toggleCamera,
  } = useLocalStreamStore();

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    setRoomIdCopied(true);
    setTimeout(() => setRoomIdCopied(false), 1500);
  };

  return (
    <div className="w-full h-full bg-dark-300 flex items-center justify-center">
      <div className="flex flex-col w-96">
        <h2 className="text-3xl font-bold text-neutral-0">Nome da sala</h2>
        <h4 className="text-sm font-normal text-neutral-500 mb-2">
          0 usuários na sala
        </h4>
        <div className="relative flex-1 max-w-full aspect-[4/3] bg-dark-200 border border-neutral-1000 p-2 rounded flex flex-col gap-y-2 items-center justify-center">
          <div className="absolute z-10 top-2 left-2">
            {mutated ? (
              <FaMicrophoneSlash
                filter="drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.85))"
                size={20}
                color="#ffffff"
              />
            ) : (
              <AudioIndicator
                audioTrack={audioStreamTracks.find((t) => t.enabled)}
              />
            )}
          </div>
          <MediaStreamView tracks={videoStreamTracks} />
        </div>
        <div className="flex w-full gap-x-4 mt-4">
          <button className="py-2 px-4 text-sm uppercase rounded-sm bg-brand-500 text-neutral-0">
            Entrar
          </button>
          <button
            onClick={toggleMutated}
            className={`py-2 px-4 transition-colors rounded-sm ${
              mutated ? "bg-orange-600" : "bg-dark-100"
            }`}
          >
            {mutated ? (
              <FaMicrophoneSlash size={12} color="#ffffff" />
            ) : (
              <FaMicrophone size={12} color="#ffffff" />
            )}
          </button>
          <button
            onClick={toggleCamera}
            className={`py-2 px-4 transition-colors rounded-sm ${
              showCamera ? "bg-dark-100" : "bg-orange-600"
            }`}
          >
            {showCamera ? (
              <FaVideo size={12} color="#ffffff" />
            ) : (
              <FaVideoSlash size={12} color="#ffffff" />
            )}
          </button>
          <button
            onClick={handleCopyRoomId}
            className={`py-2 px-4 transition-colors rounded-sm ${
              roomIdCopied ? "bg-green-600" : "bg-dark-100"
            }`}
          >
            <FaCopy size={12} color="#ffffff" />
          </button>
        </div>
      </div>
    </div>
  );
};

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
