chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
    if (obj.type == 'scrapeLeetCode') sendResponse(getCodeLink());

    if (obj.type == 'queryTitle') {
        (async () => {
            await sleep(250);
            const elem = await waitForElm('.text-sm.font-medium.capitalize');
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
    const diff = document.querySelector('.text-sm.font-medium.capitalize');
    if (diff && difficulties.has(diff.innerText)) {
        const title = document.querySelector('a.font-medium').innerText;
        const difficulty = document
            .querySelector('.text-sm.font-medium.capitalize')
            .innerText.toLowerCase();

        const formattedTitle = title
            .toLowerCase()
            .replace(/[^0-9a-z\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/\d+/, (match) => match.padStart(5, '0'));

        return { difficulty, formattedTitle };
    }
};

const getCode = () => {
    const currentURL = window.location.href;
    const code = document.querySelector(
        ".view-lines[role='presentation']"
    ).innerText;
    const storedText = `#${currentURL}\n${code}`;
    return storedText;
};

const getCodeLink = () => {
    const storedText = getCode();
    const blob = new Blob([storedText], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    return url;
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
