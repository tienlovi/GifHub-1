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

    init(opts = {}) {
        const $widget = this.$widget = $(widgetTemplate);
        this.$input = $widget.find('input');
        this.$imgList = $widget.find('.js-gif-list');
        this.onSelection = opts.onSelection;
        return this.setupListeners();
    },

    appendToDOM(selector = 'body') {
        $(selector).append(this.$widget);
        return this;
    },

    setupListeners() {
        this.$input.on('keydown change', debounce(e => {
            window.postMessage({
                giphySearch: true,
                query: e.currentTarget.value
            }, '*');
        }, 1200));

        this.$widget.on('click', 'img', e => this.imageSelected(e.currentTarget));

        window.addEventListener('message', ({ data }) => {
            if (data && data.giphyResponse) this.onImageData(data);
        });

        return this;
    },

    onImageData(data) {
        const images = data.res.data.map(image => ({
            uri: image.images.fixed_width_small.url,
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
    },

    hide() {
        this.$widget.addClass(hiddenClass);
        this.reset();
        return this;
    },

    showAt(top = 0, left = 0) {
        this.reset();
        this.$widget.removeClass(hiddenClass).css({ top, left });
        return this;
    },

    reset() {
        this.$imgList.empty();
        this.$input.val('');
        return this;
    },

    updateImageList(images = []) {
        const imageDOM = images.map(image => {
            return `<li><img src="${image.uri}" title="${image.name}"</li>`;
        }).join('');

        this.$imgList.html(imageDOM);
        return this;
    }
};
