export type SessionDescription = {
  sdp: string;
  type: "answer" | "offer";
};

export type TrackObject = {
  location: "local" | "remote";
  mid?: string; // Só necessário para tracks locais
  sessionId?: string; // Só necessário para tracks remotas
  trackName: string;
};

export type CloseTrackObject = {
  mid: string;
};

export type TracksRequest = {
  sessionDescription: SessionDescription;
  tracks: TrackObject[];
};

export type TracksResponse = {
  requiresImmediateRenegotiation: boolean;
  sessionDescription: SessionDescription;
  tracks: (TrackObject & {
    error?: {
      errorCode: string;
      errorDescription: string;
    };
  })[];
};

export type NewSessionResponse = {
  sessionId: string;
};

export type CloseTracksRequest = {
  sessionDescription: SessionDescription;
  tracks: CloseTrackObject[];
  force: boolean; // Se true, interrompe apenas o fluxo de dados dos tracks, sem renegociação do WebRTC
};

export type CloseTracksResponse = {
  sessionDescription: SessionDescription;
  tracks: (CloseTrackObject & {
    error?: {
      errorCode: string;
      errorDescription: string;
    };
  })[];
  requiresImmediateRenegotiation: boolean;
};

export type GetSessionStateResponse = {
  tracks: (TrackObject & {
    status: "active" | "inactive" | "waiting";
  })[];
};
