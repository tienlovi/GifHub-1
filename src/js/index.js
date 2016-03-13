import widget from './widget';
import {
    addBtnToToolbars,
    onPartialRender,
    onGiphyBtnClick
} from './dom';

addBtnToToolbars();
onPartialRender(addBtnToToolbars);

const giphyWidget = widget.create().appendToDOM();

onGiphyBtnClick(({ form, button, input }) => {
    const { top, left } = $(button).offset();
    giphyWidget.showAt(top, left);
});
