import {
    CallbackType,
    extractPlaylist,
} from 'm3u8-dash-clone';
import * as fs from 'fs';
import { join, dirname } from 'path';
import mkdirp from 'mkdirp';

function getNext(): CallbackType {
    return async (filename, content, error) => {
        if (!error) {
            const path = join('.', 'temp', filename);
            await mkdirp(dirname(path));
            // DON'T USE SYNC THIS IS JUST FOR EXAMPLE. IT BLOCKS YOUR
            // EVENTLOOP
            if (typeof content === 'string') {
                fs.writeFileSync(path, content, 'binary');
            } else {
                fs.writeFileSync(
                    path,
                    Buffer.from(content as ArrayBuffer),
                    'binary',
                );
            }
        } else {
            console.log(error);
        }
    };
}

async function boot() {
    process.argv.slice(2).forEach((path) => {
        return extractPlaylist(path, getNext(), {
            maxRequestSimultaneously: 4,
        });
    });
}

boot();
