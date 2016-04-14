import { getAuthenticityToken, getPreviewUri } from './page';

function getMarkdownPreview(text) {
    // Upgrade jQuery deferred to an ES6 Promise
    return Promise.resolve($.ajax({
        method: 'POST',
        url: getPreviewUri(),
        data: {
            authenticity_token: getAuthenticityToken(),
            text
        }
    }));
}

export function bypassCSPForImages(images = []) {
    const markdown = images.map(image => (
        `![${image.name}](${image.uri}) ![downsized](${image.downsizedUri})`
    )).join('\n\n');

    return getMarkdownPreview(markdown).then(res => {
        const $res = $(res);
        return Array.from($res.filter('p')).map(p => {
            const imgs = $(p).find('img');
            return {
                uri: imgs.get(0).src,
                name: imgs.get(0).alt,
                downsizedUri: imgs.get(1).src
            };
        });
    });
}
