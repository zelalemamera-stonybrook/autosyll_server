/* The following program implements a server for handling autosyll.com page, the application code is accessed through this server as a subprocess. Other files in this directory represent important parts of the webpage like 
* HTML files and images
*/
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

import { createServer } from 'node:http';
import fs from 'node:fs';
import {spawn} from 'node:child_process';

// The ip address is personal for now, and is contingent on the location of my computer
const ip = '10.0.0.202';
const port = 3000;
const address =  `http://${ip}:${port}`;

const server = createServer((request, response) => {
	// read in the headers
	const {method, url} = request;
	console.log(`request ${method} with url ${url}`);
	if (method === 'POST'){
		request.setEncoding('utf8');
		 let result = spawn('touch', ['user_input.txt']);
		 result.stdout.on('data', () => {});
		 result.stderr.on('data', (error) => { 
		 	console.log(`error with accessing file ${error}`);
			response.statusCode = 500;
			response.end();
			return;
			});
		 result.on('close', (code) => {
		 	console.log(`python process exited with code ${code}`);
			const writeStream = fs.createWriteStream('user_input.txt');
			request.on('data', (chunk) => {
				console.log(`received data from client ${chunk}`);
				writeStream.write(chunk);
			});
			request.on('end', () => {
				writeStream.close();
				result = spawn('python',  ['ProcessUserData.py']);
				result.stdout.on('data', (data) => {
					console.log(`python process finished ${data}`);
				});
				result.stderr.on('data', (data) => {
					console.log(`Python error ${data}`);
					response.statusCode = 500;
					response.end();
					return;
				});
				result.on('close', (code) => {
					console.log(`python process exited with code ${code}`);
					fs.access('syllabified.txt', (error) => {
						if (error){
							console.log(`error with accessing file ${error}`);
							response.statusCode = 500;
							response.end();
							return;
						};
						});
					const readStream = fs.createReadStream('syllabified.txt');
					response.statusCode = 200;
					response.setHeader('Content-Type', 'text/utf8');
					readStream.on('data', (chunk) => {
						response.write(chunk);
						console.log(`chunk read from syllabified.txt and written ${chunk}`);
					});
					readStream.on('end', () => {
						result = spawn('rm', ['syllabified.txt', 'wordlist.txt', 'user_input.txt']);
						result.stdout.on('data', () => {});
						result.stderr.on('data', (error) => { console.log(`error with writing file ${error}`); response.statusCode = 500; response.end(); return;});
						result.on('close', (code) => {
							console.log(`python process exited with code ${code}`);
							response.end();
							});
						});
					});
				});
			});
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
				response.statusCode = 500;
				response.end();
				return;
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
				response.statusCode = 500;
				response.end();
				return;
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
				response.statusCode = 500;
				response.end();
				return;
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
				response.statusCode = 500;
				response.end();
				return;
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
				});
			}catch(error){
				console.log(`error with sending the response ${error}`);
				response.statusCode = 500;
				response.end();
				return;
			}
		}
	else if (url === '/index.css'){
				try{
				const [,...path] = url;
				const body = fs.createReadStream(path.join(""));
				response.statusCOse = 200;
				response.setHeader('Content-Type', 'text/css');
				body.on('data', (chunk) => {
					response.write(chunk);
				});
				body.on('end', () => {
					response.end()
				});
				}catch(error){
					console.log(`error with sending the response ${error}`);
					response.statusCode = 500;
					response.end();
					return;
				
				}
			}	
}
});
	
server.listen(port, () => {
	console.log(`Server running at ${address}`);
	});