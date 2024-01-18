import { postToServer } from './lib.js';

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

const uploadSolutionCallback = (tab, useCommentAsTitle) => {
    chrome.action.setBadgeText({ tabId: tab.id, text: '...' });
    chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: 'black',
    });

    (async () => {
        if (!getState(tab)) await cacheTitle(tab.id, tab);

        const { url, code } = await chrome.tabs.sendMessage(tab.id, {
            type: 'scrapeLeetCode',
        });

        let suffix = '';

        if (useCommentAsTitle) {
            // extract as what we should append
            let comment = code.split('\n')[0];
            console.log(comment);
            // basic checks to make sure it's formatted how we would expect
            comment = comment.trim();
            if (comment.charAt(0) != '#' && comment.charAt(0) != '/') {
                console.log(
                    'uh oh we failed to get comment!',
                    comment,
                    comment.charAt(0)
                );
            }

            comment = comment.substring(1).trim().replace(/\s+/g, '-');
            console.log('trimmed', comment);
            //
            suffix = '-' + comment;
        }

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
            color: '#90EE90',
        });

        const resp = await postToServer({
            controller,
            difficulty,
            formattedTitle,
            suffix,
            url,
            code,
            password,
            fetchMethod: fetch,
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
};

chrome.commands.onCommand.addListener((command, tab) => {
    uploadSolutionCallback(tab, true);
});

chrome.action.onClicked.addListener((tab) =>
    uploadSolutionCallback(tab, false)
);

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
