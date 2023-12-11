const state = {};

chrome.action.onClicked.addListener((tab) => {
    console.log('WTF');
    chrome.action.setBadgeText({ tabId: tab.id, text: 'hi' });

    chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: 'black',
    });
    (async () => {
        const fileText = await chrome.tabs.sendMessage(tab.id, {
            type: 'scrapeLeetCode',
        });

        const { difficulty, formattedTitle } = state[tab.id];

        const password = (
            await (
                await fetch(chrome.runtime.getURL('config/secret.json'))
            ).json()
        )['password'];

        const resp = await fetch('http://www.jasontung.me:3001/updateGithub', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                difficulty,
                formattedTitle,
                fileText,
                apiKey: password,
            }),
        });

        const d = await resp.text();

        if (resp.status == 200) {
            chrome.action.setBadgeBackgroundColor({
                tabId: tab.id,
                color: 'green',
            });
            chrome.action.setBadgeText({ tabId: tab.id, text: d });
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
        (async () => {
            const resp = await chrome.tabs.sendMessage(tabId, {
                type: 'queryTitle',
            });
            if (resp) {
                saveTabState(tabId, resp);
            }
        })();
    }
    return true;
});

const saveTabState = (tabid, tabstate) => {
    if (!(tabid in state)) state[tabid] = {};
    state[tabid] = { ...state[tabid], ...tabstate };
};
