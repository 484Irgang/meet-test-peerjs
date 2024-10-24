"use client";

import { useMeetSocket } from "@/context/meet-socket";
import { use, useEffect } from "react";

export default function RoomPage({
  params,
}: {
  params: Promise<{ "room-id": string }>;
}) {
  const { requestToJoinRoom, socketActive } = useMeetSocket();
  const roomId = use(params)["room-id"];

  useEffect(() => {
    if (socketActive) requestToJoinRoom(roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketActive]);

  return <div className="w-full h-full bg-dark-300"></div>;
}
