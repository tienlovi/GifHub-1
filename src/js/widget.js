import debounce from 'lodash.debounce';

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
        return this.setupListener();
    },

    appendToDOM(selector = 'body') {
        $(selector).append(this.$widget);
        return this;
    },

    setupListener() {
        this.$input.on('keydown change', debounce(e => {
            window.postMessage({
                giphySearch: true,
                query: e.currentTarget.value
            }, '*');
        }, 1200));

        window.addEventListener('message', msg => {
            if (!(msg.data && msg.data.giphyResponse)) return;

            this.updateImageList(msg.data.res.data);
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
            const name = image.slug;
            const uri = image.images.fixed_width_small.url;
            return `<li><img src="${uri}" title="${name}"</li>`;
        }).join('');

        this.$imgList.html(imageDOM);
        return this;
    }
};
