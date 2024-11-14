import { TrackObject } from "@/services/cloudflare_calls/types";

export interface IUser {
  id: string;
  name: string;
  joined: boolean;
  speaking: boolean;
  media?: {
    audioEnabled: boolean;
    cameraEnabled: boolean;
    screenEnabled: boolean;
    sessionTracks: TrackObject[];
  };
  socketId?: string;
  sessionId?: string;
}
