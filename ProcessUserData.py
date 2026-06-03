'''
The following python program runs the main application for the syllabifier. it reads in files from user_input.txt and then calls the syllabification algorithm over them.
The outputs will be stored in a file called syllabified.txt.
'''
from pathlib import Path 
import re
import subprocess

def prepare_input():
	'''
	reads in the raw user input text and produces a text file with a single word per line.
	'''
	try:
		tokenized = []
		pathin = Path('user_input.txt');
		for line in pathin.open(mode='r'):
			tokenized += tokenize(line)
		Path.touch('wordlist.txt')
		pathout = Path('wordlist.txt')
		for word in tokenized:
			with pathout.open(mode='a') as f:
				f.write(f'{word}\n')
	except(e):
		print(f'there was an exception {e}')
	subprocess.run(['python', 'syllabify.py'])
		
def tokenize(string: str):
	'''
	removes all punctuation and breaks the input by spaces
	'''
	punct = re.compile(r'[!@#$%&\*\(\)\-_+={\[}\]|\\:;\"\'<,>\.\?/]')
	space = re.compile(r'\s')
	unpunctuated = punct.sub("",string).strip()
	tokenized = space.split(unpunctuated)
	return tokenized

if __name__ == '__main__':
	prepare_input()