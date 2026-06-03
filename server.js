/* The following program implements a server for handling autosyll.com page, the application code is accessed through this server as a subprocess. Other files in this directory represent important parts of the webpage like 
* HTML files and images
*/

import { createServer } from 'node:http';
import fs from 'node:fs';
import {spawn} from 'node:child_process';

// The ip address is personal for now, and is contingent on the location of my computer
const ip = '10.0.0.202';
const port = 3000;
const address =  `http://${ip}:${port}`

const server = createServer((request, response) => {
	// read in the headers
	const {method, url} = request;
	console.log(`request ${method} with url ${url}`);
	if (method === 'POST'){
		request.setEncoding('utf8');
		const writeStream = fs.createWriteStream('user_input.txt');
		request.on('data', (chunk) => {
			writeStream.write(chunk);
		})
		request.on('end', () => {
			writeStream.close();
			//spawn('python',  ['ProcessUserData.py', 'user_input.txt']);
			})
		}
	else if (method === 'GET'){
		if (url === `/`){
			try{
				const body = fs.createReadStream('index.html');
				body.setEncoding('utf8');
				response.statusCode = 200;
				response.setHeader('Content-Type', 'text/html');
				body.on('data', (chunk) => {
					response.write(chunk);
					})
				body.on('end', () => {
					response.end();
				})
			}catch(error){
				console.log(` error with sending the response ${error}`);
		}
		}
		else if (url === `/sidebar.html`){
			try{
				const body = fs.createReadStream('sidebar.html', 'utf8');
				response.statusCode = 200;
				response.setHeader('Content-Type', 'text/html');
				body.on('data', (chunk) => {
					response.write(chunk);
					})
				body.on('end', () => {
					response.end();
				})
			}catch(error){
				console.log(`error with sending the response ${error}`);
			}	
		}
		else if (url === '/?'){
			return;
			//response.statusCode = 201;
			//response.end();
		}
		else if (url === '/images/CloudGateStatue.png'){
			try{
				const [, ...path] = url;
				const body = fs.createReadStream(path.join(""));
				response.statusCode = 200;
				response.setHeader('Content-Type', 'image/png');
				body.on('data', (chunk) => {
					response.write(chunk);
					})
				body.on('end', () => {
					response.end();
				})
			}catch(error){
				console.log(`error with sending the response ${error}`);
			}
		}
		else if (url === '/favicon.ico'){
				try{
				const [, ...path] = url;
				const body = fs.createReadStream(path.join(""));
				response.statusCode = 200
				response.setHeader('Content-Type', 'image/png');
				body.on('data', (chunk) => {
					response.write(chunk);
					})
				body.on('end', () => {
					response.end();
				})
			}catch(error){
				console.log(`error with sending the response ${error}`);
			}
		}
	else if (url === '/form.js'){
				try{
				const [, ...path] = url;
				const body = fs.createReadStream(path.join(""));
				response.statusCode = 200;
				response.setHeader('Content-Type', 'text/javascript');
				body.on('data', (chunk) => {
					response.write(chunk);
					})
				body.on('end', () => {
					response.end();
				})
			}catch(error){
				console.log(`error with sending the response ${error}`);
			}
	}
	else if (url ==='/syllabified.txt'){
		request.setEncoding('utf8');
		const writeStream = fs.createWriteStream('user_input.txt');
		request.on('data', (chunk) => {
			writeStream.write(chunk);
		})
		request.on('end', () => {
			writeStream.close();
			const result = spawn('python',  ['ProcessUserData.py']);
			fs.access('syllabified.txt', (error) => {
				if (error){
					console.log(`error with application ${error}`);
					response.statusCode = 500;
					response.end();
					return;
					}
			})
			const readStream = fs.createReadStream('syllabified.txt');
			response.statusCode = 200;
			response.setHeader('Content-Type', 'text/plain');
			readStream.on('data', (chunk) => {
				response.write(chunk);
			}
			readStream.on('end', () => {
				response.end();
			}
			})

	}
	}
	}
	);
	
server.listen(port, () => {
	console.log(`Server running at ${address}`);
	});