const state = {};

const extractProblem = (url) => {
    return /(?:problems\/)([^/]+)/.exec(url)[1];
};

const cacheTitle = async (tabid, tab) => {
    const url = tab.url;
    const resp1 = await chrome.tabs.sendMessage(tabid, {
        type: 'queryTitle',
    });
    if (resp1 && resp1.formattedTitle) {
        saveTabState(extractProblem(url), resp1);
    }
};

// testings
const getState = (tab) => {
    return state[extractProblem(tab.url)];
};

chrome.commands.onCommand.addListener((command) => {
    console.log(`Command "${command}" triggered`);
});

chrome.action.onClicked.addListener((tab) => {
    chrome.action.setBadgeText({ tabId: tab.id, text: 'hi' });
    chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: 'black',
    });

    (async () => {
        if (!getState(tab)) await cacheTitle(tab.id, tab);

        const { url, code } = await chrome.tabs.sendMessage(tab.id, {
            type: 'scrapeLeetCode',
        });

        console.log(code);
        // extract as what we should append
        const comment = code.split('\n')[0];
        console.log(comment);

        const { difficulty, formattedTitle } = getState(tab);

        const controller = new AbortController();

        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const password = (
            await (
                await fetch(chrome.runtime.getURL('config/secret.json'))
            ).json()
        )['password'];

        chrome.action.setBadgeBackgroundColor({
            tabId: tab.id,
            color: 'blue',
        });

        const resp = await fetch('http://www.jasontung.me:3001/updateGithub', {
            signal: controller.signal,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                difficulty,
                formattedTitle,
                fileText: `${url}\n${code}`,
                apiKey: password,
            }),
        });

        const d = await resp.text();

        if (resp.status == 200) {
            const badgeText = d.substring(0, d.indexOf('-')).replace(/^0+/, '');
            chrome.action.setBadgeBackgroundColor({
                tabId: tab.id,
                color: 'green',
            });
            chrome.action.setBadgeText({
                tabId: tab.id,
                text: badgeText,
            });
        } else {
            console.log(resp);
            chrome.action.setBadgeBackgroundColor({
                tabId: tab.id,
                color: 'red',
            });
        }
        chrome.storage.local.set({
            jasbot_success: resp.status == 200,
            jasbot_last: formattedTitle,
        });
        // chrome.action.openPopup();
    })();
    return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        tab.url.includes('leetcode.com') &&
        changeInfo.status === 'complete' &&
        tab.status == 'complete'
    ) {
        cacheTitle(tabId, tab);
    }
    return true;
});

const saveTabState = (tabIdentifier, tabstate) => {
    if (!(tabIdentifier in state)) state[tabIdentifier] = {};
    state[tabIdentifier] = { ...state[tabIdentifier], ...tabstate };
};
