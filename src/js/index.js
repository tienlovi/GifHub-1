import widget from './widget';
import {
    addBtnToToolbars,
    onPartialRender,
    onGiphyBtnClick,
    insertTextAtCursor
} from './gh-page';

addBtnToToolbars();
onPartialRender(addBtnToToolbars);

onGiphyBtnClick(({ form, button, input }) => {
    const { top, left } = $(button).offset();
    let giphyWidget = widget.create({
        onSelection: data => {
            const textarea = $(form).find('textarea').get(0);
            insertTextAtCursor(textarea, toMarkdownImage(data));
        },
        onDispose: () => giphyWidget = null
    }).appendToDOM().showAt(top, left);
});

function toMarkdownImage({ uri, name }) {
    return `![${name}](${uri})`;
}
