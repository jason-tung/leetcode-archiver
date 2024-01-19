import { readFileSync } from 'fs';
import conf from './config/secret.json' assert { type: 'json' };
import { postToServer } from './lib.js';
import fetch from 'node-fetch';

const { password } = conf;

const generatePostElement = () => {
    return {
        controller: {},
        difficulty: 'test',
        formattedTitle: '99999-second-sample',
        suffix: '',
        url: 'http://jasontung.me:3001',
        code: `
        # this is a sample code
        # random number here: ${Math.random()}
        def main():
          print("hello wrld")
        `,
        password,
        posturl: 'http://localhost:3001/updateGithub',
        fetchMethod: fetch,
    };
};

const noSuffixPostElement = generatePostElement();
const suffixPostElement = {
    ...generatePostElement(),
    suffix: 'this-is-suffix',
};

const doTests = async () => {
    const noSuffixRet = await postToServer(noSuffixPostElement);
    console.log(await noSuffixRet.text());
    const suffixRet = await postToServer(suffixPostElement);
    console.log(await suffixRet.text());
};

doTests();
