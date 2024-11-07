import { MediaStream } from "@/presentation/components/LocalMediaStream";
import { useLocalStreamStore } from "@/store/local-stream";
import { Room } from "@/types/room";
import { useState } from "react";
import {
  FaCopy,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

export const RoomPreparation = ({ room }: { room: Room }) => {
  const [roomIdCopied, setRoomIdCopied] = useState(false);

  const { mutated, toggleMutated, stream, showCamera, toggleCamera } =
    useLocalStreamStore();

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
        <MediaStream stream={stream} />
        <div className="flex w-full gap-x-4 mt-4">
          <button className="py-2 px-4 text-sm uppercase rounded-sm bg-brand-500 font-medium text-neutral-0">
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
