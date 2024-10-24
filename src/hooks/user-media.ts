import { useMediaStore } from "@/store/user-media";
import { useEffect, useRef } from "react";

export const useUserMedia = () => {
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const setStream = useMediaStore((state) => state.setStream);

  const getUserMedia = async () => {
    const userStream = await navigator?.mediaDevices?.getUserMedia({
      audio: true,
      video: true,
    });

    setStream(userStream);

    if (userVideoRef.current) userVideoRef.current.srcObject = userStream;
  };

  useEffect(() => {
    getUserMedia();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { userVideoRef, getUserMedia };
};
