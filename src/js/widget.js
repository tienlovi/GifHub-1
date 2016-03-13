import debounce from 'lodash.debounce';
import { bypassCSPForImages } from './github';

// brfs doesn't work with ES6 import syntax
// https://github.com/substack/brfs/issues/39
const fs = require('fs');
const widgetTemplate = fs.readFileSync('src/giphy-widget.html', 'utf8');
const hiddenClass = 'giphy-widget-hidden';

export default {
    create() {
        return Object.create(this).init();
    },

    init() {
        const $widget = this.$widget = $(widgetTemplate);
        this.$input = $widget.find('input');
        this.$imgList = $widget.find('.js-gif-list');
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

        window.addEventListener('message', ({ data }) => {
            if (!(data && data.giphyResponse)) return;

            const images = data.res.data.map(image => ({
                uri: image.images.fixed_width_small.url,
                name: image.slug
            }));

            bypassCSPForImages(images)
                .then(imgList => this.updateImageList(imgList))
                .catch(err => console.error(err));
        });
        return this;
    },

    hide() {
        this.$widget.addClass(hiddenClass);
        return this;
    },

    showAt(top = 0, left = 0) {
        this.$widget.removeClass(hiddenClass).css({ top, left });
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
