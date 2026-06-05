
import fs from 'node:fs';
import {spawn} from 'node:child_process';

spawn('echo', ['hello one', '>', 'read.txt']);
const writer = fs.createWriteStream('write.txt');
const reader = fs.createReadStream('read.txt');

reader.on('data', (chunk) => { writer.write(chunk); 
	console.log(`${chunk} written`);
} );



