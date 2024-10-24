import PeerClientProvider from "@/context/peer-client";
import RoomPageTemplate from "@/presentation/pages/room";

export default function RoomPage({
  params,
}: {
  params: { "room-id": string };
}) {
  const roomId = params["room-id"];

  return (
    <PeerClientProvider>
      <RoomPageTemplate roomId={roomId} />
    </PeerClientProvider>
  );
}
