import { useUserMedia } from "@/hooks/user-media";

export const LocalMediaStream = () => {
  const { userVideoRef } = useUserMedia();
  return (
    <div className="w-full max-h-[54%] bg-dark-100 rounded-md">
      <video className="w-full h-full" ref={userVideoRef} autoPlay />
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
    <div className="h-[12rem] w-[24rem] bg-dark-100 rounded-md">
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
