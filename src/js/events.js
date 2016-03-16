export function startSearch(text) {
    window.postMessage({
        giphySearch: true,
        query: text
    }, '*');
}

export function listenForGiphyResponse(cb) {
    const handler = ({ data }) => {
        if (!(data && data.giphyResponse)) return;
        cb(data);
    };

    window.addEventListener('message', handler);

    return function removeListener() {
        window.removeEventListener('message', handler);
    }
}
