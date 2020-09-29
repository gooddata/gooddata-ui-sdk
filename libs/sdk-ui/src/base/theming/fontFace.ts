// (C) 2007-2020 GoodData Corporation

/**
 *
 * @param {string} src - Font src
 * @param {string} type - Font type
 */

function fontFace(src: string, type: string) {
    const newStyle = document.createElement("style");
    newStyle.appendChild(
        document.createTextNode(
            `@font-face {
             font-family: GDCustomFont;
             src: ${src};
             ${type === "normal" ? `font-weight: 400` : `font-weight: 700`}
        }`,
        ),
    );

    document.head.appendChild(newStyle);
}

/**
 *
 * @param {string} src - Font src
 * @param {string} type - Font type
 *
 * @internal
 */

export function createFontFace(src: string, type: string) {
    return fontFace(src, type);
}
