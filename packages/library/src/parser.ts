import {
    downloadFileFromUrl,
    flatten,
    getAbsolutePath,
} from './utils';
import {
    CallbackType,
    Config,
    FileInformation,
    Manifest,
} from './intefaces';
import * as m3u8 from 'm3u8-parser';
import { Semaphore } from 'async-mutex';
import { parse } from 'mpd-parser';
import { DashManifest } from './dash-interface';

export async function extractPlaylist(
    url: string,
    next: CallbackType,
    config: Config = { maxRequestSimultaneously: 10 },
): Promise<void> {
    if (url === '') {
        throw new Error('URL is required');
    }

    await downloadContent(
        url,
        next,
        new Semaphore(
            config.maxRequestSimultaneously || 10,
        ),
        undefined,
        true,
    );
}

async function loadM3u8(
    fileInformation: FileInformation,
    callback: CallbackType,
    semaphore: Semaphore,
    relativePath: string,
) {
    const parser = new m3u8.Parser();

    parser.push(fileInformation.content as string);

    parser.end();

    const parsedManifest = parser.manifest as Manifest;

    const playlists = parsedManifest.playlists || [];

    await Promise.all(
        playlists.map((res) =>
            downloadContent(
                res.uri,
                callback,
                semaphore,
                relativePath,
                true,
            ),
        ),
    );

    const mediaGroups = Object.keys(
        ((parsedManifest.mediaGroups || {}).AUDIO || {})
            .group_audio || {},
    );

    await Promise.all(
        mediaGroups
            .map(
                (res) =>
                    (parsedManifest.mediaGroups.AUDIO || {})
                        .group_audio[res],
            )
            .map((res) =>
                downloadContent(
                    res.uri,
                    callback,
                    semaphore,
                    relativePath,
                ),
            ),
    );

    const segments = parsedManifest.segments || [];

    await Promise.all(
        segments.map((res) =>
            downloadContent(
                res.uri,
                callback,
                semaphore,
                relativePath,
                true,
            ),
        ),
    );
}

async function loadMpd(
    fileInformation: FileInformation,
    callback: CallbackType,
    semaphore: Semaphore,
    relativePath: string,
) {
    const parsedManifest = parse(
        fileInformation.content as string,
        {
            manifestUri: fileInformation.fileName,
        },
    ) as DashManifest;

    const audioSegments = flatten(
        Object.keys(parsedManifest.mediaGroups.AUDIO.audio)
            .map(
                (res) =>
                    parsedManifest.mediaGroups.AUDIO.audio[
                        res
                    ],
            )
            .map((res) =>
                res.playlists.map((playlist) =>
                    playlist.segments.map((res) => res.uri),
                ),
            ),
    );

    const playlistSegment = flatten(
        parsedManifest.playlists
            .map((res) => res.segments)
            .map((segment) =>
                segment.map((seg) => seg.uri),
            ),
    );

    await Promise.all(
        playlistSegment.map((segment) => {
            return downloadContent(
                segment,
                callback,
                semaphore,
                relativePath,
                false,
            );
        }),
    );

    await Promise.all(
        [...audioSegments].map((segment) => {
            return downloadContent(
                segment,
                callback,
                semaphore,
                relativePath,
                false,
            );
        }),
    );
}

function downloadContent(
    url: string,
    callback: CallbackType,
    semaphore: Semaphore,
    relativePath = getAbsolutePath(url),
    isSegment = false,
): Promise<void> {
    return downloadFileFromUrl(
        url,
        relativePath,
        semaphore,
        isSegment,
    ).then(async (fileInformation) => {
        callback(
            fileInformation.fileName,
            fileInformation.content,
        );

        const isM3u8File = fileInformation.fileName.endsWith(
            '.m3u8',
        );

        const isDash =
            fileInformation.fileName.endsWith('.xml') ||
            fileInformation.fileName.endsWith('.mpd');

        if (isM3u8File || isDash) {
            if (isM3u8File) {
                await loadM3u8(
                    fileInformation,
                    callback,
                    semaphore,
                    relativePath,
                );
            } else {
                await loadMpd(
                    fileInformation,
                    callback,
                    semaphore,
                    relativePath,
                );
            }
        }
    });
}
