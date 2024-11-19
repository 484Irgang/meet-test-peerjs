import { memo, useEffect, useState } from "react";

type CallMediaStreamProps = {
  tracks: MediaStreamTrack[];
};

const CallMediaStreamFN = ({ tracks }: CallMediaStreamProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!tracks) return;
    console.log(tracks);
    const stream = new MediaStream(tracks);
    setStream(stream);
    return () => {
      stream.getTracks().forEach((track) => stream.removeTrack(track));
      setStream(null);
    };
  }, [tracks]);

  return (
    <div className="flex flex-1 min-w-[calc(20%-0.25rem)] content-start aspect-[16/6] min-h-[160px] bg-neutral-800 rounded-lg items-center justify-center">
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

export const CallMediaStream = memo(
  CallMediaStreamFN,
  (prev, next) => prev.tracks === next.tracks
);
