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
    audioTracks?: TrackObject[];
    videoTracks?: TrackObject[];
  };
  socketId?: string;
}
