import { useLocalStreamStore } from "@/store/local-stream";
import { useEffect } from "react";

export const useUserMedia = (sessionId: string | null) => {
  const setStream = useLocalStreamStore((state) => state.setStream);
  const localStream = useLocalStreamStore((state) => state.stream);

  const getUserMedia = async () => {
    const userStream = await navigator?.mediaDevices?.getUserMedia({
      audio: true,
      video: true,
    });

    setStream(userStream);
    return userStream;
  };

  useEffect(() => {
    if (sessionId) getUserMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return { localStream };
};
