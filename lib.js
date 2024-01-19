// crazy that i need to inject a fetch method
// writing extensions is really fun for sure !
export const postToServer = ({
    controller,
    difficulty,
    formattedTitle,
    suffix,
    url,
    code,
    password,
    fetchMethod,
    posturl = 'http://www.jasontung.me:3001/updateGithub',
}) =>
    fetchMethod(posturl, {
        signal: controller.signal,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            difficulty,
            formattedTitle,
            suffix,
            fileText: `${url}\n${code}`,
            apiKey: password,
        }),
    });
