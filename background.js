chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(
        tab.id,
        {
            command: 'scrapeLeetcode',
        },
        ({ formattedTitle, difficulty, url }) => {
            console.log({ formattedTitle, difficulty, url });
            chrome.downloads.download(
                {
                    url,
                    filename: `leetcode/${difficulty}/${formattedTitle}.py`,
                    // saveAs: true,
                    conflictAction: 'uniquify',
                },
                function (downloadId) {
                    if (downloadId) {
                        console.log('Download started successfully');
                    } else {
                        console.error('Download failed');
                    }
                }
            );
        }
    );
});
