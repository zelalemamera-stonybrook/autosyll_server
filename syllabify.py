
EN_VOWELS = {"AA","AE","AH", "AO","AW","AX","AXR","AY","EH","ER","EY","IH","IX","IY","OW","OY","UH","UW","UX"}
import re

def get_words_from_file(fname: str):
    '''
    Reads a wordlist file that contains one word per line and returns a list of the words
    '''
    with open(fname, 'r') as f:
        word_list = [word.lower().strip() for word in f]
    return word_list


def get_transcription_dict_from_file(fname: str):
    '''
    Reads CMU dict ARPABET transcription file into a dictionary and returns it
    '''
    token_dict = {}
    with open(fname, 'r') as f:
        for line in f:
            line = line.strip()
            token_list = line.split(" ")
            token_dict[token_list[0]] = tuple(token_list[1:])
    return token_dict

def lookup_transcriptions(wordlist: list, transcriptiondict: dict):
    '''
    Attempts to match transcriptions to items in wordlist, returns a dictionayr of transcribed words or a list of out of vocabulary words
    '''
    transcribed = {word:transcriptiondict[word] for word in wordlist if word in transcriptiondict.keys()}
    OOVwords = [word for word in wordlist if word not in transcriptiondict.keys()]
    return transcribed, OOVwords
        

def estimate_onsets(transcriptions: dict[str:tup[str]], vowels: set[str]):
    '''
    Find all the attested word-initial onsets and returns them as a list of all licit onsets according to the dataset
    '''
    licit_onsets = set()
    for pronunciation in transcriptions.values():
        for i, phone in enumerate(pronunciation):
            vowel = re.sub(r"\d", "", phone)
            if vowel in vowels:
                tup = tuple(list(pronunciation)[:i])
                if(len(tup) != 0):
                    licit_onsets.add(tup)
                break
    return licit_onsets


def mark_vowels(transcription: tup[str], vowels: set[str]):
    '''
    Find the locations of each vowel in the transcription and returns it as a sequence of integers corresponding to indices of the vowels.
    '''
    indexes = [ i for i, phone in enumerate(transcription) if (re.sub(r"\d", "", phone)) in vowels]
    return indexes


def mark_syllstarts(transcription: tup[str], nuc_indices: list[int], licit_onsets: list[str[):
    '''
    Find the locations of the first phone of each syllable and returns it as a sequence of integers corresponding to indices of syllable starts.
    '''
    syllable_locations = []
    if len(nuc_indices) == 1:
        return []
    n = -2
    while(-len(nuc_indices) <= n):
        prev = nuc_indices[n]
        next = nuc_indices[n+1]
        candidate = list(transcription)[prev + 1:next]
        while (tuple(candidate) not in licit_onsets) and len(candidate) > 0:
            if len(candidate) == 1:
                candidate = []
            else:
                candidate = candidate[1:]
            prev+=1
        syllable_locations.append(prev)
        n -=1
    syllable_locations.sort()
    return syllable_locations


def split_transcription(transcription: list[str], syllstart_indices: list[int]):
    '''
    Splits a transcription into a sequence of syllables and returns the list of strings representing each syllable
    '''
    transcription = list(transcription)
    syllstart_indices.append(10**10) # This will prevent the list comprehension from breaking
    syllstart_indices.append(-1)
    syllstart_indices.sort()
    syllable_list = [tuple(transcription[syllstart_indices[i] + 1: min(syllstart_indices[i + 1] + 1, len(transcription))]) for i in range(len(syllstart_indices) - 1)]
    # the above list comprehension slices transcriptions between the indices of syllstart. I added -1 and +infinity so that i can control the situation where the slice is in the start,
    # or at the end
    return syllable_list


def get_syllabifications(transcriptions: list[str], licit_onsets:list[str], vowels:list[str]):
    '''
    Syllabify a series of transcriptions and return a dictionary of syllabified transcriptions.
    '''
    syllabifications = {}
    for word, trans in transcriptions.items():
        nucleus_indices = mark_vowels(trans, vowels)
        syllstart_indices = mark_syllstarts(trans, nucleus_indices, licit_onsets)
        syllabifications[word] = split_transcription(trans, syllstart_indices)
    return syllabifications


def write_syllables(fname: str, syllabified_dict: dict):
    '''
    Writes syllabifications to a file in a specific format. Each line in the output file contains a tab-separated word-syllabification pair and ends in a newline.
    The syllabification is in ARPABET notation, but with a . inserted between syllables.
    '''
    with open(fname, 'w') as f:
        for word, trans in syllabified_dict.items():
            for i, tup in enumerate(trans):
                joined = " ".join(tup)
                trans[i] = joined
            syllables = " . ".join(trans)
            line = f"{word}\t{syllables}\n"
            f.write(line)
            
def syllabify_english(wordlistfname: str, outfname: str):
    '''
    This function looks up transcriptions for a word list and syllabifies them
    '''
    vowels = EN_VOWELS # collection of vowels for English ARPABET

    wordlist = get_words_from_file(wordlistfname)
    cmudict = get_transcription_dict_from_file("cmudict.dict")
    
    transcribed_wordlist, OOV_wordlist = lookup_transcriptions(wordlist, cmudict)
    licit_onsets = estimate_onsets(transcribed_wordlist, vowels)
    syllabified_dict = get_syllabifications(transcribed_wordlist, licit_onsets, vowels)
    write_syllables(outfname, syllabified_dict)



def main():

    infname = "wordlist.txt"
    outfname = "syllabified.txt"
    syllabify_english(infname, outfname)


if __name__ == "__main__":
    main()
