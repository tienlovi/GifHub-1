import debounce from 'lodash.debounce';
import { bypassCSPForImages } from './github';

// brfs doesn't work with ES6 import syntax
// https://github.com/substack/brfs/issues/39
const fs = require('fs');
const widgetTemplate = fs.readFileSync('src/giphy-widget.html', 'utf8');
const hiddenClass = 'giphy-widget-hidden';

export default {
    create(...args) {
        return Object.create(this).init(...args);
    },

    init({ onSelection, onDispose }) {
        const $widget = this.$widget = $(widgetTemplate);
        this.$input = $widget.find('input');
        this.$imgList = $widget.find('.js-gif-list');
        this.onSelection = onSelection;
        this.onDispose = onDispose;
        return this.setupListeners();
    },

    appendToDOM(selector = 'body') {
        $(selector).append(this.$widget);
        return this;
    },

    setupListeners() {
        this.$input.on('keydown', debounce(e => {
            this.$imgList.empty();
            this.toggleLoading(true);
            window.postMessage({
                giphySearch: true,
                query: e.currentTarget.value
            }, '*');
        }, 1000));

        this.$widget.on('click', 'img', e => this.imageSelected(e.currentTarget));

        window.addEventListener('message', ({ data }) => {
            if (data && data.giphyResponse) this.onImageData(data);
        });

        return this;
    },

    onImageData(data) {
        if (this.disposed) return;

        this.toggleLoading(false);
        const images = data.res.data.map(image => ({
            uri: image.images.original.url,
            name: image.slug
        }));

        bypassCSPForImages(images)
            .then(imgList => this.updateImageList(imgList))
            .catch(err => console.error(err));
    },

    imageSelected(img) {
        this.onSelection({
            uri: img.src,
            name: img.title
        });
        this.dispose();
    },

    showAt(top = 0, left = 0) {
        this.$widget.removeClass(hiddenClass).css({ top, left });
        return this;
    },

    dispose() {
        this.$widget.remove();
        this.$widget = null;
        this.$input = null;
        this.$imgList = null;
        this.disposed = true;
        this.onDispose();
    },

    toggleLoading(show) {
        const action = show ? 'removeClass' : 'addClass';
        this.$widget.find('.js-giphy-loading')[action](hiddenClass);
    },

    updateImageList(images = []) {
        const imageDOM = images.map(image => {
            return `<li><img src="${image.uri}" title="${image.name}"</li>`;
        }).join('');

        this.$imgList.html(imageDOM);
        return this;
    }
};
