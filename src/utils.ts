import originalFetch from 'isomorphic-fetch';
import fetch from 'fetch-retry';
import { ContentInfo, FileInformation } from './intefaces';
import { Semaphore } from 'async-mutex';

/**
 * Fetch with power of retry if the request fails then it try for some time more
 */
export const fetcher = fetch(originalFetch, {
    retries: 5,
    retryDelay: 1000,
}) as typeof window.fetch;

/**
 * Retrieve the filename from the url
 * @param url endpoint for the url
 * @param hasError to avoid loop of errors
 */
export function getFileNameFromUrl(
    url: string,
    hasError = false,
): string {
    try {
        const parsedUrl = new URL(url).pathname.split('/');
        return parsedUrl[parsedUrl.length - 1];
    } catch (e) {
        if (hasError) {
            throw e;
        }
        // Sorry little hack
        return getFileNameFromUrl(
            `https://something.com/${url}`,
            true,
        );
    }
}

/**
 * Downloads the file as array buffer to store with the filename
 * @param url
 * @param relativePath relative path for the content relative
 * @param mutex
 * @param isSegment download it as text
 */
export async function downloadFileFromUrl(
    url: string,
    relativePath = '',
    mutex: Semaphore = new Semaphore(1),
    isSegment = false,
): Promise<FileInformation> {
    const parsedUrl = new URL(
        concatAndResolveUrl(url, relativePath),
    );

    const [, release] = await mutex.acquire();

    let error: unknown;

    return fetcher(parsedUrl.toString())
        .then(async (res) => {
            release();
            if (res.ok) {
                return res;
            }
            error = res;
            return;
        })
        .then((docs) => {
            if (!docs) {
                return undefined;
            }
            if (isSegment) {
                return docs.text() as never;
            }
            return docs.arrayBuffer() as never;
        })
        .then((res: ContentInfo | undefined) => {
            const fileName = parsedUrl.pathname.toString();
            if (!res) {
                return {
                    fileName,
                    error,
                };
            }

            return {
                fileName,
                content: res,
            };
        });
}

/**
 * This function concat the parts with the relative paths
 * https://stackoverflow.com/a/2676231
 * @param baseUrl
 * @param path
 */
export function concatAndResolveUrl(
    path: string,
    baseUrl?: string,
): string {
    try {
        new URL(path);
        return path;
    } catch (e) {}

    if (!baseUrl) {
        return path;
    }

    const url1 = baseUrl.split('/');
    const url2 = path.split('/');
    const url3 = [];
    for (let i = 0, l = url1.length; i < l; i++) {
        if (url1[i] === '..') {
            url3.pop();
        } else if (url1[i] !== '.') {
            url3.push(url1[i]);
        }
    }
    for (let i = 0, l = url2.length; i < l; i++) {
        if (url2[i] == '..') {
            url3.pop();
        } else if (url2[i] !== '.') {
            url3.push(url2[i]);
        }
    }
    return url3.join('/');
}

/**
 * Retrieve the absolute path for the url
 * example
 * https://google.com/something/something.html to
 * https://google.com/something
 *
 * Sometimes playlist contains the relative paths
 * @param url
 */
export function getAbsolutePath(url: string): string {
    return url.substr(0, url.lastIndexOf('/'));
}

/**
 * Clone array buffer
 * https://stackoverflow.com/a/22114687
 * @param src
 */
export function cloneArrayBuffer(
    src: ArrayBuffer,
): ArrayBuffer {
    const dst = new ArrayBuffer(src.byteLength);
    new Uint8Array(dst).set(new Uint8Array(src));
    return dst;
}

/**
 * Flat array [[1,2]] to [1,2]
 * @param arr
 */
export function flatten(arr: any[]): never[] {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(
            Array.isArray(toFlatten)
                ? flatten(toFlatten)
                : toFlatten,
        );
    }, []);
}
