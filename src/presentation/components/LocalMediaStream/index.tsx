import { useLocalStreamStore } from "@/store/local-stream";
import { Fragment } from "react";

export const LocalMediaStream = () => {
  const localStream = useLocalStreamStore((state) => state.stream);
  return (
    <div className="w-full max-w-[540px] h-[360px] max-h-[54%] bg-dark-200 border border-brand-900 p-2 rounded-md flex flex-col gap-y-2 items-center justify-center">
      {localStream?.active ? (
        <video
          className="w-full h-full"
          ref={(node) => {
            if (node) node.srcObject = localStream;
          }}
          autoPlay
        />
      ) : (
        <Fragment>
          <div className="w-10 h-10 rounded-all border-2 border-b-0 border-t-0 border-brand-500 animate-spin" />
          <h1>Aguarde um momento, preparando seu stream</h1>
        </Fragment>
      )}
    </div>
  );
};

export const RemoteMediaStream = ({
  stream,
}: {
  stream: MediaStream | null;
}) => {
  if (!stream) return null;
  return (
    <div className="h-[12rem] w-[24rem] bg-dark-200 rounded-md p-2 border border-brand-900">
      <video
        className="w-full h-full"
        ref={(node) => {
          if (node && stream) {
            node.srcObject = stream;
          }
        }}
        autoPlay
      />
    </div>
  );
};
