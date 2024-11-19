import { usePeerClient } from "@/context/peer-client/index.";
import { AudioIndicator, MediaStreamView } from "@/presentation/components";
import CallButton from "@/presentation/components/CallButton";
import { useLocalTracksStore } from "@/store/local-stream-tracks";
import { useRoomStore } from "@/store/room";
import { Room } from "@/types/room";
import { useState } from "react";
import { FaMicrophoneSlash } from "react-icons/fa";

export const RoomPreparation = ({
  room,
  onEnterRoom,
}: {
  room: Room;
  onEnterRoom: () => void;
}) => {
  const [roomIdCopied, setRoomIdCopied] = useState(false);

  const { connected } = usePeerClient();

  const roomUsers = useRoomStore((state) => state.roomUsers);

  const usersInRoomCount = Object.values(roomUsers ?? {})?.filter(
    (user) => user.joined
  )?.length;

  const {
    mutated,
    toggleMutated,
    videoStreamTracks,
    audioStreamTracks,
    showCamera,
    toggleCamera,
  } = useLocalTracksStore();

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    setRoomIdCopied(true);
    setTimeout(() => setRoomIdCopied(false), 1500);
  };

  return (
    <div className="w-full h-full bg-dark-300 flex items-center justify-center">
      <div className="flex flex-col w-96">
        <h2 className="text-3xl font-bold text-neutral-0">{room?.name}</h2>
        <h4 className="text-sm font-normal text-neutral-500 mb-2">
          {usersInRoomCount ?? 0}{" "}
          {usersInRoomCount === 1 ? "usuário" : "usuários"} na sala
        </h4>
        <div className="relative flex-1 max-w-full aspect-[4/3] bg-dark-200 border border-neutral-1000 rounded flex flex-col items-center justify-center">
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
          <button
            disabled={!connected}
            onClick={onEnterRoom}
            className="py-2 px-4 text-sm uppercase rounded-sm bg-brand-500 text-neutral-0 disabled:opacity-40"
          >
            {connected ? "Entrar" : "Conectando..."}
          </button>
          <CallButton
            onClick={toggleMutated}
            className={mutated ? "!bg-orange-600" : undefined}
            icon={mutated ? "muted" : "microphone"}
          />
          <CallButton
            onClick={toggleCamera}
            icon={showCamera ? "video" : "hidden-video"}
            className={!showCamera ? "!bg-orange-600" : undefined}
          />

          <CallButton
            icon="copy"
            onClick={handleCopyRoomId}
            className={roomIdCopied ? "!bg-green-600" : undefined}
          />
        </div>
      </div>
    </div>
  );
};
