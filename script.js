const TITLE_SELECTOR = 'a.no-underline.whitespace-normal';
const DIFFICULTY_SELECTOR = '[class*="text-difficulty-"]';
const CODE_SELECTOR = '.view-lines';

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
    if (obj.type == 'scrapeLeetCode') sendResponse(getCodeAndUrl());

    if (obj.type == 'queryTitle') {
        (async () => {
            await sleep(250);
            const elem = await waitForElm(DIFFICULTY_SELECTOR);
            const info = updateTitle();
            if (info) {
                sendResponse(info);
            }
        })();
    }
    return true;
});

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const difficulties = new Set(['Easy', 'Medium', 'Hard']);

const updateTitle = () => {
    const diff = document.querySelector(DIFFICULTY_SELECTOR);
    if (diff && difficulties.has(diff.innerText)) {
        const title = document.querySelector(TITLE_SELECTOR).innerText;
        const difficulty = document
            .querySelector(DIFFICULTY_SELECTOR)
            .innerText.toLowerCase();

        const formattedTitle = title
            .toLowerCase()
            .replace(/[^0-9a-z\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/\d+/, (match) => match.padStart(5, '0'));

        return { difficulty, formattedTitle };
    }
};

const getCodeAndUrl = () => {
    const currentURL = window.location.href;
    const code = document.querySelector(CODE_SELECTOR).innerText;
    return { url: `# ${currentURL}`, code };
};

const waitForElm = async (selector) => {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
};
