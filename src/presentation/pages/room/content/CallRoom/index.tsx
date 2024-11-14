import CallButton, {
  CallButtonIconTypes,
} from "@/presentation/components/CallButton";
import { useLocalTracksStore } from "@/store/local-stream-tracks";
import { useRemoteStreamTracksStore } from "@/store/remote-stream-tracks";
import { toPairs } from "ramda";
import { useEffect, useState } from "react";

type CallButtons = {
  icon: CallButtonIconTypes;
};

export const CallRoom = () => {
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

  console.log("remote tracks available", remoteTracks);

  const handleInteractButton = (icon: CallButtonIconTypes) => () => {
    const actions = {
      microphone: toggleMutated,
      muted: toggleMutated,
      video: toggleCamera,
      "hidden-video": toggleCamera,
      "share-screen": () => console.log("share screen"),
      "end-call": () => console.log("end call"),
      copy: () => console.log("copy"),
    };

    actions[icon]();
  };

  const callButtons: CallButtons[] = [
    { icon: mutated ? "muted" : "microphone" },
    { icon: showCamera ? "video" : "hidden-video" },
    { icon: "share-screen" },
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
              ["end-call", "hidden-video", "muted"].includes(button.icon) &&
              "!bg-orange-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

type CallMediaStreamProps = {
  tracks: MediaStreamTrack[];
};

const CallMediaStream = ({ tracks }: CallMediaStreamProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!tracks) return;
    const stream = new MediaStream(tracks);
    setStream(stream);
    return () => {
      stream.getTracks().forEach((track) => stream.removeTrack(track));
      setStream(null);
    };
  }, [tracks]);

  return (
    <div className="flex flex-1 min-w-[20% - 0.25rem] aspect-[16/6] bg-neutral-800 rounded-lg items-center justify-center">
      {stream?.active ? (
        <video
          className="h-full max-w-full max-h-full rounded-sm"
          ref={(node) => {
            if (node) node.srcObject = stream;
          }}
          autoPlay
          playsInline
        />
      ) : (
        <div className="w-6 h-6 rounded-all border-2 border-b-0 border-t-0 border-brand-500 animate-spin" />
      )}
    </div>
  );
};

export default CallRoom;
