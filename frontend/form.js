/* the following program handles the behavior of the form element in the home page of autosyll.
*/

const form = document.querySelector("form");
const textarea = document.getElementById("userinput");
const submit = document.getElementById("submit");
const output = document.getElementById("output");

async function syllabify( ){
	output.value = 'processing your input ... ';
	console.log(textarea.value);
	const response = await fetch('http://autosyll/proper_syllables.txt', {
		method: 'POST',
		headers: {'Content-Type': 'text/plain',},
		body: textarea.value,
	});
	if (!response.ok){
		console.log(response.StatusCode);
		output.value = 'sorry try again later';
		return;
	}
	output.value = "";
	const stream = response.body.pipeThrough(new TextDecoderStream('utf8'));
	for await (const chunk of stream){
		console.log(`received and decoded chunk from sever ${chunk}`);
		output.value += chunk;
	}
	
}

textarea.addEventListener('click', () => {
	textarea.value = "";
	}, {once: true});
output.addEventListener('click', () => {
	const message = "HH AH0 . L OW1 | W ER1 L D";
	console.log(message);
	if (output.value === message ){
		output.value = "";
		}
}, {once: true});
submit.addEventListener('click', syllabify)
