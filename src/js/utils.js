export function toMarkdownImage({ uri, name }) {
    return `![${name}](${uri})`;
}
