/**The following Javascript program runs the main application for the syllabifier. it reads in files from user_input.txt and then calls the syllabification algorithm over them.*/
import {syllabify} from "./syllabify.mjs";

/**
* reads in the raw user input text and produces a text file with a single word per line. Then calls the main syllabifier algorithm on this.
* @param {string} body is a string representing the user's request string. It is unfiltered, and should be processed before being syllabified.
* @returns {string} the returned string s a syllabified output to be displayed for the user.
*/
function prepareInput(body){	
	console.log(`body received in application ${body} type of body ${typeof body}`);
	const filtered = []
	const lines = body.split(/\n/);
	console.log(`lines created ${lines} lines[0] is ${lines[0]}`);
	for (const line of lines){
		console.log(`${line} is ${typeof line}`);
		if(typeof line === "string"){
			filtered.push(filter(line));
			}
		}
	console.log(`text filtered ${filtered}`);
	try{
	return syllabify(filtered);	
	}catch(error){
		throw error;
		}	
}

/**
*removes all punctuation and breaks the input by spaces
*@param {string}
*@returns {string}
*/
function filter(line){
	const pattern = /[!@#$%&\*\(\)\-_+={\[}\]|\\:;\"\'<,>\.\?\/]/g
	const filtered = (line.replaceAll(pattern, "")).toLowerCase();
	if (typeof filtered === "string"){
		return filtered;
		}
}

export {prepareInput};