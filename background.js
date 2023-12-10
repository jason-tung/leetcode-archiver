const state = {};

chrome.action.onClicked.addListener(async (tab) => {
    const url = await chrome.tabs.sendMessage(tab.id, {
        type: 'scrapeLeetCode',
    });

    const { difficulty, formattedTitle } = state[tab.id];
    console.log(difficulty, formattedTitle, url);
    chrome.downloads.download({
        url,
        filename: `leetcode/${difficulty}/${formattedTitle}.py`,
        conflictAction: 'uniquify',
    });
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
