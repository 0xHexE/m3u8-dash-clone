// import { downloadContent, extractPlaylist } from './parser';
// import { Semaphore } from 'async-mutex';

import { extractPlaylist } from './parser';

describe('Parse module', () => {
    beforeEach(() => {
        jest.setTimeout(90000);
    });

    it('should download content work', async function () {
        await extractPlaylist(
            'https://videodelivery.net/3ce1e1f69e2173aae74fd7d97d062c36/manifest/video.mpd',
            (filename, content, error) => {
                console.log(filename, content, error);
            },
        );
        // TODO: PUT NON COPYRIGHT VIDEO HERE
        // let i = 0;
        // expect.assertions(10);
        // const semaphore = new Semaphore(10);
        // return downloadContent(
        //     '',
        //     (filename, content, error) => {
        //         console.log(++i);
        //         expect(true).toBe(true);
        //     },
        //     semaphore,
        // );
    });

    it('should extractPlaylist', function () {
        // TODO: PUT NON COPYRIGHT VIDEO HERE
        // return extractPlaylist(
        //     '',
        //     (filename, content, error) => {},
        //     {
        //         maxRequestSimultaneously: 10,
        //     },
        // );
    });
});
