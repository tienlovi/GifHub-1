import widget from './widget';
import {
    addBtnToToolbars,
    onPartialRender,
    onGiphyBtnClick
} from './gh-page';

addBtnToToolbars();
onPartialRender(addBtnToToolbars);

const giphyWidget = widget.create({
    onSelection: console.log.bind(console)
}).appendToDOM();

onGiphyBtnClick(({ form, button, input }) => {
    const { top, left } = $(button).offset();
    giphyWidget.showAt(top, left);
});
