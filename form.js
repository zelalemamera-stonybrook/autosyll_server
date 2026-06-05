/* the following program handles the behavior of the form element in the home page of autosyll.
*/

const form = document.querySelector("form");
const textarea = document.getElementById("userinput");
const submit = document.getElementById("submit");
const output = document.getElementById("output");

async function syllabify( ){
	output.value = 'processing your input ... ';
	console.log(textarea.value);
	const response = await fetch('syllabified.txt', {
		method: 'POST',
		headers: {'Content-Type': 'text/utf8',},
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
	const message = "humpty	HH AH1 M P . T IY0\ndumpty	D AH1 M P . T IY0\nsat	S AE1 T\non	AA1 N\na	AH0\nwall	W AO1 L";
	console.log(message);
	if (output.value === message ){
		output.value = "";
		}
}, {once: true});
submit.addEventListener('click', syllabify)
