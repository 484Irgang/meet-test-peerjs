import { Fragment } from "react";

export const MediaStream = ({ stream }: { stream: MediaStream | null }) => {
  return (
    <div className="flex-1 max-w-full aspect-[4/3] bg-dark-200 border border-neutral-1000 p-2 rounded flex flex-col gap-y-2 items-center justify-center">
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
