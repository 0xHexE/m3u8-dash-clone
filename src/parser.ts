import {
    downloadFileFromUrl,
    getAbsolutePath,
} from './utils';
import {
    CallbackType,
    Config,
    Manifest,
} from './intefaces';
import * as m3u8 from 'm3u8-parser';
import { Semaphore } from 'async-mutex';

export async function extractPlaylist(
    url: string,
    next: CallbackType,
    config: Config = { maxRequestSimultaneously: 10 },
): Promise<void> {
    await downloadContent(
        url,
        next,
        new Semaphore(
            config.maxRequestSimultaneously || 10,
        ),
    );
}

export function downloadContent(
    url: string,
    callback: CallbackType,
    semaphore: Semaphore,
    relativePath = getAbsolutePath(url),
): Promise<void> {
    return downloadFileFromUrl(
        url,
        relativePath,
        semaphore,
    ).then(async (fileInformation) => {
        callback(
            fileInformation.fileName,
            fileInformation.content,
        );

        const isM3u8File = fileInformation.fileName.endsWith(
            '.m3u8',
        );

        if (isM3u8File) {
            const parser = new m3u8.Parser();

            parser.push(fileInformation.content as string);

            parser.end();

            const parsedManifest = parser.manifest as Manifest;

            const playlists =
                parsedManifest.playlists || [];

            await Promise.all(
                playlists.map((res) =>
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
                    ),
                ),
            );
        }
    });
}
