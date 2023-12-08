console.log('inject');
chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
    // console.log('The message from the background page: ' + obj);
    // console.log(obj);
    sendResponse(scrapeData());
});

const scrapeData = () => {
    const title = document.querySelector('a.font-medium').innerText;
    const difficulty = document
        .querySelector('.text-sm.font-medium.capitalize')
        .innerText.toLowerCase();
    const currentURL = window.location.href;
    const code = document.querySelector(
        ".view-lines[role='presentation']"
    ).innerText;

    const formattedTitle = title
        .toLowerCase()
        .replace(/[^0-9a-z\s]/g, '')
        .replace(/\s+/g, '-');

    const storedText = `#${currentURL}\n${code}`;

    // console.log(formattedTitle, difficulty, currentURL);
    const blob = new Blob([storedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    r = { formattedTitle, difficulty, url };
    // chrome.runtime.sendMessage(r);
    return r;
};
