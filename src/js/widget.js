import debounce from 'lodash.debounce';
import { bypassCSPForImages } from './github';

// brfs doesn't work with ES6 import syntax
// https://github.com/substack/brfs/issues/39
const fs = require('fs');
const widgetTemplate = fs.readFileSync('src/giphy-widget.html', 'utf8');
const hiddenClass = 'giphy-hidden';
const noResultsMsg = 'No GIFs Found :(';

export default {
    create(...args) {
        return Object.create(this).init(...args);
    },

    init({ onSelection, onDispose }) {
        const $widget = this.$widget = $(widgetTemplate);
        this.$input = $widget.find('input');
        this.$imgList = $widget.find('.js-gif-list');
        this.$message = $widget.find('.js-giphy-message');
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
            this.onSearchStart();
            window.postMessage({
                giphySearch: true,
                query: e.currentTarget.value
            }, '*');
        }, 1000));

        this.$widget.on('click', 'img', e => this.imageSelected(e.currentTarget));

        // TODO: Cleanup event handler on dispose()
        window.addEventListener('message', ({ data }) => {
            if (data && data.giphyResponse) this.onImageData(data);
        });

        $(document).on('click.giphy', e => {
            if (this.$widget.get(0).contains(e.target)) return;
            this.dispose();
        });

        return this;
    },

    onSearchStart() {
        this.$imgList.empty();
        this.toggleLoading(true);
        this.toggleMessage(false);
    },

    onImageData({ res: { data } }) {
        if (this.disposed) return;
        if (!data.length) {
            this.toggleLoading(false);
            this.toggleMessage(true, noResultsMsg);
            return this;
        }

        const images = data.map(image => ({
            uri: image.images.original.url,
            name: image.slug
        }));

        bypassCSPForImages(images)
            .then(imgList => {
                this.toggleLoading(false);
                this.updateImageList(imgList);
            }).catch(err => {
                console.error(err);
                this.toggleLoading(false);
            });

        return this;
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
        $(document).off('click.giphy');
        this.$widget.remove();
        this.disposed = true;
        this.onDispose && this.onDispose();
    },

    toggleLoading(show) {
        const action = show ? 'removeClass' : 'addClass';
        this.$widget.find('.js-giphy-loading')[action](hiddenClass);
    },

    toggleMessage(show, message) {
        this.$message.text(message)[show ? 'removeClass' : 'addClass'](hiddenClass);
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
