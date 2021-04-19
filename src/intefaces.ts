/* eslint-disable @typescript-eslint/no-explicit-any */
export type ContentInfo = ArrayBuffer | string;
export type CallbackType = (
    filename: string,
    content?: ContentInfo,
    error?: any,
) => void;

export interface IPlaylistResult {
    fileName: string;
    content?: ContentInfo;
    error?: any;
}

export interface FileInformation {
    content?: ContentInfo;
    fileName: string;
    error?: any;
}

export interface Manifest {
    allowCache: boolean;
    discontinuityStarts: any[];
    segments: any[];
    version: number;
    mediaGroups: MediaGroups;
    playlists: Playlist[];
}

export interface MediaGroups {
    AUDIO: AUDIOClass;
    VIDEO: ClosedCaptions;
    'CLOSED-CAPTIONS': ClosedCaptions;
    SUBTITLES: ClosedCaptions;
}

export interface AUDIOClass {
    group_audio: GroupAudio;
}

export interface GroupAudio {
    [props: string]: Eng;
}

export interface Eng {
    default: boolean;
    autoselect: boolean;
    language: string;
    uri: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClosedCaptions {}

export interface Playlist {
    attributes: Attributes;
    uri: string;
    timeline: number;
}

export interface Attributes {
    AUDIO: AUDIOEnum;
    'FRAME-RATE': string;
    'AVERAGE-BANDWIDTH': string;
    BANDWIDTH: number;
    CODECS: string;
    RESOLUTION: Resolution;
}

export enum AUDIOEnum {
    GroupAudio = 'group_audio',
}

export interface Resolution {
    width: number;
    height: number;
}

export interface Config {
    maxRequestSimultaneously?: number;
}
