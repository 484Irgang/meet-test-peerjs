import { Fragment, memo, useEffect, useState } from "react";

const MediaStreamViewFunction = ({
  tracks,
}: {
  tracks: MediaStreamTrack[] | null;
}) => {
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
    <div className="flex-1 flex items-center justify-center flex-col gap-y-2 rounded p-2">
      {stream?.active ? (
        <video
          className="w-full h-full scale-105"
          ref={(node) => {
            if (node) node.srcObject = stream;
          }}
          autoPlay
          playsInline
        />
      ) : (
        <Fragment>
          <div className="w-6 h-6 rounded-all border-2 border-b-0 border-t-0 border-brand-500 animate-spin" />
          <h1 className="text-sm ">
            Aguarde um momento, preparando seu stream
          </h1>
        </Fragment>
      )}
    </div>
  );
};

export const MediaStreamView = memo(
  MediaStreamViewFunction,
  (prev, next) => prev.tracks?.length === next.tracks?.length
);
