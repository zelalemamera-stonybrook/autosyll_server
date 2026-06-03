/* the following program handles the behaviour of the form element in the home page of autosyll.
*/

const form = document.querySelector("form");
const textarea = form.elements["textarea"];
const submit = form.elements["submit"];
const output = form.elements["output"];

async function syllabify( ){
	output.textContent = 'processing your input ... ';
	const response = await fetch('syllabified.txt');
	if (response.ok){
		const syllabified = await response.text();
		output.textContent = syllabified;
	}
	else{
		console.log('invalid request');
	}
}

form.addEventListener('click', syllabify);