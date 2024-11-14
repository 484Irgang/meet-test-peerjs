import CallButton, {
  CallButtonIconTypes,
} from "@/presentation/components/CallButton";
import { useLocalTracksStore } from "@/store/local-stream-tracks";
import { useRemoteStreamTracksStore } from "@/store/remote-stream-tracks";
import { pipe, toPairs } from "ramda";
import { useState } from "react";
import { CallMediaStream } from "./CallMediaStream";

type CallButtons = {
  icon: CallButtonIconTypes;
};

type CallRoomProps = {
  roomId: string;
  endCall: () => void;
};

export const CallRoom = ({ roomId, endCall }: CallRoomProps) => {
  const [roomIdCopied, setRoomIdCopied] = useState(false);

  const {
    audioStreamTracks,
    videoStreamTracks,
    mutated,
    toggleCamera,
    toggleMutated,
    showCamera,
  } = useLocalTracksStore();

  const remoteTracks = useRemoteStreamTracksStore(
    (state) => state.remoteTracks
  );

  const handleCopyTimeout = () => {
    setRoomIdCopied(true);
    setTimeout(() => setRoomIdCopied(false), 1500);
  };

  const handleInteractButton = (icon: CallButtonIconTypes) => () => {
    const actions = {
      microphone: toggleMutated,
      muted: toggleMutated,
      video: toggleCamera,
      "hidden-video": toggleCamera,
      "share-screen": () => console.log("share screen"),
      "end-call": () => endCall,
      copy: () =>
        pipe(
          () => window.navigator.clipboard.writeText(roomId),
          handleCopyTimeout
        )(),
    };

    actions[icon]();
  };

  const callButtons: CallButtons[] = [
    { icon: mutated ? "muted" : "microphone" },
    { icon: showCamera ? "video" : "hidden-video" },
    // { icon: "share-screen" },
    { icon: "copy" },
    { icon: "end-call" },
  ];

  return (
    <div className="flex-1 flex w-full h-full bg-dark-300 flex-col">
      <div className="flex flex-1 p-4 gap-4 flex-wrap overflow-y-auto">
        <CallMediaStream
          tracks={[...audioStreamTracks, ...videoStreamTracks]}
        />
        {toPairs(remoteTracks).map(([userId, tracks]) => (
          <CallMediaStream key={userId} tracks={tracks} />
        ))}
      </div>
      <div className="w-full flex p-5 items-center justify-center gap-4 bg-dark-100">
        {callButtons.map((button, index) => (
          <CallButton
            key={index}
            icon={button.icon}
            iconSize={14}
            onClick={handleInteractButton(button.icon)}
            className={`py-3 px-5 ${
              ["end-call", "hidden-video", "muted"].includes(button.icon)
                ? "!bg-orange-600"
                : button.icon === "copy" && roomIdCopied
                ? "!bg-green-600"
                : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CallRoom;
