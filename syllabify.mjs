/**The following javascript program is a maxmum onset principle based automatic syllabifier of english text. The algorithm takes in phone data from the provided corpus and uses this as a basis for estimating the syllable boundaries of each word. then it writes this into an output text file. */
import dictionary from './en_us_arpa.json' with {type: 'json'};
import onsets from './onset_database.json' with {type: 'json'};

/**
*runs the main program of the syllabifier
*@param string[] this is a filtered line by line representation of the user's input.
*@returns {string} the correct syllabification of each of the user's words (if they are in the dictionary) each printed on one line exactly separated by a tab from their syllabifications.
*/
function syllabify(lines){
	console.log(`received lines in syllabifier ${lines} type of lines ${typeof lines}`);
	const enVowels = new Set(["AA","AE","AH", "AO","AW","AX","AXR","AY","EH","ER","EY","IH","IX","IY","OW","OY","UH","UW","UX"]);
	console.log(`obtaining a word list`);
	const wordList = getWordList(lines);
	console.log(`obtained a word list ${[wordList, typeof wordList]}`);
	const [transcribedWordlist, oovList ] = lookupTranscriptions(wordList, dictionary);
	console.log(`syllabifiying the transcriptions ${[transcribedWordlist, typeof transcribedWordlist]}`);
	const syllabified = getSyllabifications(transcribedWordlist, onsets, enVowels);
	return syllabified;
	}

/**
* Takes the list of transcriptions and applies the maximum onset principle to them. Then returns a string representing the syllabified transcription of the input.
*@param transcribedWordlist string[] a list of strings that are the utterances of the user in their phonemic form
*@param onsets string[] a list of strings that are considered valid beggingings of a vowel center.
*@param enVowels {Set} a set of strings representing the vowel sounds of the langugage.
*/
function getSyllabifications(transcribedWordlist, onsets, enVowels){
	const syllabified = [];
	for (const word of transcribedWordlist){
		if (word === '<unknown>'){
			syllabified.push(word);
			continue;
			}
		console.log(`marking vowels ${[word, typeof word]}`);
		const nucleusIndices = markVowels(word, enVowels);
		console.log(`marking syllable starts`);
		const syllStartIndices = markSyllStarts(word, nucleusIndices, onsets);
		const syllabification = splitTranscription(word, syllStartIndices);
		syllabified.push(syllabification.join(" . "));
		}
	console.log(`output to be sent ${syllabified}`);
	return syllabified.join(" | ");
	}

/**
*  Find the locations of each vowel in the transcription and returns it as a sequence of integers corresponding to indices of the vowels.
*@param word {string} a phonemic sequence
*@param enVowels {Set} a set of english vowels
*@returns int[] a list of indices marking the location of the vowel
*/
function markVowels(word, enVowels){
	const array = []
	const transcription = word.split(" ");
	for (const i in transcription){
		var phone = transcription[i].replaceAll(/\d/g, "");
		console.log(`phone found ${[phone, typeof phone]}`);
		if (enVowels.has(phone)){
			console.log(`vowel found`);
			array.push(parseInt(i));
			}
		}
	console.log(`marked vowel index ${array}`);
	return array;
	}

/**
* finds the locations of the first phone of each syllable in the transcription and returns it as a sequence of integers corresponding to indices of syllable starts.
*@param word {string} the transcription of the utternace
*@param nucleusIndices int[] identifies where the vowel phone is in the word.
*@param onsets string[] a list of valid phone sequences
*@returns int[] the starting location of each syllable in the word
*/
function markSyllStarts(word, nucleusIndices, onsets){
	const licitOnsets = new Set(onsets);
	const transcription = word.split(" ");
	console.log(`working with transcription ${transcription}`);
	const syllableLocations = [];
	console.log(`nucleus indices ${nucleusIndices}`);
	if (nucleusIndices.length === 1){ return [];}
	var n = -2;
	//the loop processes the string in reverse order since onsets are by default a prefix of the syllable in question. 
	while(-(nucleusIndices.length) <= n){
		var prev = nucleusIndices.at(n);
		var next = nucleusIndices.at(n+1);
		// get the largest possible onset then sequentially shrink it based on whether or not it is valid
		console.log(`slicing between ${prev + 1} and ${next}`);
		var candidate = transcription.slice(prev + 1, next);
		console.log(`onset candidate ${candidate}`);
		while (!licitOnsets.has(candidate.join(" ")) && candidate.length > 0){
			if (candidate.length === 1){
				candidate = [];
				}
			else{
				candidate = candidate.slice(1);
				console.log(`new candidate ${candidate}`);
				prev+=1;
				
				}
			}
		console.log(`syllable start index found ${prev}`);
		syllableLocations.push(prev);
		n -=1;
		}
	syllableLocations.sort();
	console.log(`marked syllable starts ${syllableLocations}`);
	return syllableLocations;
	}


/**
*given the starting position of each syllable in this word, it chunks the phones by syllable then returns them as a list.
*@param word {string} a phonemic sequence
*@param syllStartIndices int[] the starts of each syllable in word.
*@returns string[] a list of strings representing the syllables of this word
*/
function splitTranscription(word, syllStartIndices){
	const transcription = word.split(" ");
	syllStartIndices.push(9999);
	syllStartIndices.push(-1);
	syllStartIndices.sort();
	const syllableList = [];
	console.log(`splitting transcription by syllables ${transcription} with locations ${syllStartIndices}`);
	for (var i = 0; i < syllStartIndices.length - 1; i +=1){
		console.log(`slicing between ${syllStartIndices[i] + 1} and ${Math.min(syllStartIndices[i + 1] + 1, transcription.length)}`);
		var syllable = transcription.slice(syllStartIndices[i] + 1, Math.min(syllStartIndices[i + 1] + 1, transcription.length)).join(" ");
		console.log(`syllable found ${syllable}`);
		syllableList.push(syllable);
		}
	return syllableList;
	}
/**
*   Attempts to match the words with their pronunciations returns a dictionary of transcribed words and a list of out of vocabulary words
*@param string[] a list of words representing the user's input
*@param dictionary {string: string} is a dictionary that maps a script representation of a word to the phoneme representation.
* @returns list[] the object contains two lists, one is a list of transcriptions for each key, and the other is a list of invalid keys. 
*/
function lookupTranscriptions(wordList, dictionary){
	const transcribedWordlist = [];
	const oovList = [];
	for (const word of wordList){
		if (typeof word === "string"){	
			var value = dictionary[word];
			if (typeof value === "string"){
				transcribedWordlist.push(value);
				}
			else{
				transcribedWordlist.push('<unknown>');
				oovList.push(word);
				}
			
			}
		}
	console.log(`generated the transcriptions ${transcribedWordlist}`);
	return [transcribedWordlist, oovList];
	}


/**
*reads each line in the input and breaks it down by whitespace, extracting the token contained. it returns the result as a list of words
*@param string[] lines a list of lines written by the user and filtered
*@returns string[] a list of words that the user wrote.
*/
function getWordList(lines){
	var wordList = [];
	for (const line of lines){
		console.log(`processing line ${[line, typeof line]}`);
		var tokens = strip(line).split(" ");
		var array = [];
		for (const token of tokens){
			console.log(`token extracted ${[token, typeof token]}`);
			array.push(strip(token));
			}
		wordList = wordList.concat(array);
		}
	console.log(`created a wordlist ${wordList}`);
	return wordList;
	}
	
/**
*strips whitespace from the ends of the string
*@param {string} the string to be stripped
*@returns {string} a stripped string
*/
function strip(string){
	console.log(`stripping line ${[string, typeof string]}`);
	var tokens = string;
	if (tokens[-1] === " "){
		tokens = tokens.slice(0, tokens.length - 1);
		}
	if (tokens[0] === " "){
		tokens = tokens.slice(1);
		}
	console.log(`stripped line ${[tokens, typeof tokens]}`);
	return tokens;
	}
	
export {syllabify, strip};
	
	
	
	
	
	
	
	
	
	
	