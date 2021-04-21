import {
    cloneArrayBuffer,
    concatAndResolveUrl,
    downloadFileFromUrl,
    fetcher,
    getAbsolutePath,
    getFileNameFromUrl,
} from './utils';
import { Semaphore } from 'async-mutex';

describe('Utils module', () => {
    it('should be download file', () => {
        expect.assertions(2);

        return downloadFileFromUrl(
            'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            '',
            new Semaphore(1),
            true,
        ).then((docs) => {
            expect(docs.fileName).toBe(
                '/x36xhzz/x36xhzz.m3u8',
            );
            expect(typeof docs.content === 'string').toBe(
                true,
            );
        });
    });

    it('should concat the file', () => {
        expect(
            concatAndResolveUrl(
                '../x36xhzz.m3u8',
                'https://test-streams.mux.dev/x36xhzz/something',
            ),
        ).toBe(
            'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        );
    });

    it('should be download file', () => {
        expect.assertions(2);

        return downloadFileFromUrl(
            '../x36xhzz.m3u8',
            'https://test-streams.mux.dev/x36xhzz/something',
            new Semaphore(1),
            true,
        ).then((docs) => {
            expect(docs.fileName).toBe(
                '/x36xhzz/x36xhzz.m3u8',
            );
            expect(typeof docs.content === 'string').toBe(
                true,
            );
        });
    });

    it('should fetcher work', () => {
        expect.assertions(1);

        return fetcher(
            'https://reqres.in/api/users?page=2',
            {},
        )
            .then((docs) => docs.json())
            .then((docs) => expect(docs.page).toBe(2));
    });

    it('should extract url', () => {
        const fileNameFromUrl = getFileNameFromUrl(
            'https://google.com/google.com',
        );
        expect(fileNameFromUrl).toBe('google.com');

        const fileNameFromUrl1 = getFileNameFromUrl(
            'segment.ts',
        );
        expect(fileNameFromUrl1).toBe('segment.ts');

        const fileNameFromUrl2 = getFileNameFromUrl(
            'a/segment.ts',
        );
        expect(fileNameFromUrl2).toBe('segment.ts');
    });

    it('should give absolute path', function () {
        expect(
            getAbsolutePath(
                'https://google.com/something/something.html',
            ),
        ).toBe('https://google.com/something');
    });

    it('should arrayBuffer', function () {
        const result = cloneArrayBuffer(
            new ArrayBuffer(123),
        );
        expect(result.byteLength).toBe(123);
    });
});
