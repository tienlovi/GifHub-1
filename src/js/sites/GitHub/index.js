import {
    addBtnToToolbars,
    onPartialRender,
    onGiphyBtnClick,
    insertTextAtCursor
} from './page';
import widget from '../../widget';
import { toMarkdownImage } from '../../utils';
import { bypassCSPForImages } from './api';
import debounce from 'lodash.debounce';

addBtnToToolbars();
onPartialRender(addBtnToToolbars);

onGiphyBtnClick(({ form, button, input }) => {
    const onSelection = function onSelection(data) {
        const textarea = $(form).find('textarea').get(0);
        insertTextAtCursor(textarea, toMarkdownImage(data));
    };

    const onTextChange = function onTextChange(text) {
        window.postMessage({
            giphySearch: true,
            query: text
        }, '*');
    };

    const onImageData = function onImageData({ data }) {
        if (!(giphyWidget && data.giphyResponse)) return;

        if (!data.res.data.length) {
            giphyWidget
                .toggleLoading(false)
                .toggleMessage(true, 'No Results Found :(');
            return;
        }

        const images = data.res.data.map(image => ({
            uri: image.images.original.url,
            name: image.slug
        }));

        bypassCSPForImages(images)
            .then(imgList => {
                giphyWidget.toggleLoading(false);
                giphyWidget.updateImageList(imgList);
            }).catch(err => {
                console.error(err);
                giphyWidget.toggleLoading(false);
            });
    };

    const onDispose = function onDispose() {
        window.removeEventListener('message', ImageData);
        giphyWidget = null;
    }

    window.addEventListener('message', onImageData);

    const { top, left } = $(button).offset();
    let giphyWidget = widget.create({
        onSelection,
        onDispose,
        onTextChange: debounce(onTextChange, 1000)
    }).appendToDOM().showAt(top + 28, left - 124);
});
