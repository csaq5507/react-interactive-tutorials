function paragraphs(strings: string) {
    var lines = strings.split(/(?:\r\n|\n|\r)/);
    return lines.map((line) => {
        var trimmed = line.replace(/^\s+/gm, '');
        if (trimmed == '') {
            return '\n\n';
        } else {
            return trimmed;
        }
    }).join(' ').replace(/\n[\ ]+/g, '\n').trim();
}


export {paragraphs}
