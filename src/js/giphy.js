const apiBase = '//api.giphy.com/v1';
const apiKey = 'dc6zaTOxFJmzC'; // Public API key

export function giphySearch(searchTerm) {
    const encodedSearch = encodeURIComponent(searchTerm);
    const uri = `${apiBase}/gifs/search?q=${encodedSearch}&api_key=${apiKey}`;
    return fetch(uri).then(res => res.json());
}

// function getImage(src, name) {
//     return `<img src="${src}" alt="${name}" title="${name}">`;
// }

// gifiSearch('obama').then(res => {
//     const images = res.data.map({ images, slug } => (
//         getImage(images.fixed_width_small.url, slug)
//     ));
// });
