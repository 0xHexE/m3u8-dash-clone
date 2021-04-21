// http://app.quicktype.com

export interface DashManifest {
    allowCache: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    discontinuityStarts: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    segments: any[];
    endList: boolean;
    mediaGroups: MediaGroups;
    uri: string;
    duration: number;
    playlists: DashManifestPlaylist[];
}

export interface MediaGroups {
    AUDIO: Audio;
    VIDEO: ClosedCaptions;
    'CLOSED-CAPTIONS': ClosedCaptions;
    SUBTITLES: ClosedCaptions;
}

export interface Audio {
    audio: AudioClass;
}

export interface AudioClass {
    [props: string]: Eng;
}

export interface Eng {
    language: string;
    autoselect: boolean;
    default: boolean;
    playlists: EngPlaylist[];
    uri: string;
}

export interface EngPlaylist {
    attributes: PurpleAttributes;
    uri: string;
    endList: boolean;
    timeline: number;
    resolvedUri: string;
    targetDuration: number;
    segments: Segment[];
    mediaSequence: number;
}

export interface PurpleAttributes {
    NAME: string;
    BANDWIDTH: number;
    CODECS: string;
    'PROGRAM-ID': number;
}

export interface Segment {
    uri: string;
    timeline: number;
    duration: number;
    resolvedUri: string;
    map: Map;
    number: number;
}

export interface Map {
    uri: string;
    resolvedUri: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClosedCaptions {}

export interface DashManifestPlaylist {
    attributes: FluffyAttributes;
    uri: string;
    endList: boolean;
    timeline: number;
    resolvedUri: string;
    targetDuration: number;
    segments: Segment[];
    mediaSequence: number;
}

export interface FluffyAttributes {
    NAME: string;
    AUDIO: string;
    SUBTITLES: string;
    RESOLUTION: Resolution;
    CODECS: string;
    BANDWIDTH: number;
    'PROGRAM-ID': number;
}

export interface Resolution {
    width: number;
    height: number;
}
