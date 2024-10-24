import { useUserMedia } from "@/hooks/user-media";
import { useRemoteStreamStore } from "@/store/remote-stream";

export const LocalMediaStream = () => {
  const { userVideoRef } = useUserMedia();
  return (
    <div className="w-full max-h-[54%] bg-dark-100 rounded-md">
      <video className="w-full h-full" ref={userVideoRef} autoPlay />
    </div>
  );
};

export const RemoteMediaStream = () => {
  const remoteStream = useRemoteStreamStore((state) => state.remoteStream);
  if (!remoteStream) return null;
  return (
    <div className="h-[12rem] w-[24rem] bg-dark-100 rounded-md">
      <video
        className="w-full h-full"
        ref={(node) => {
          if (node && remoteStream) {
            node.srcObject = remoteStream;
          }
        }}
        autoPlay
      />
    </div>
  );
};
