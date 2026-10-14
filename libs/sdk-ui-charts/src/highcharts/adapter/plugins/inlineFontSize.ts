// (C) 2026 GoodData Corporation

const FONT_SIZE = /^(\d+(?:\.\d+)?)(px|em|%)$/;

const svgRootFontSizes = new WeakMap<Element, number>();

function getSvgRootFontSize(svg: Element): number {
    let fontSize = svgRootFontSizes.get(svg);
    if (fontSize === undefined) {
        // One forced style recalculation per chart instead of one per text element
        fontSize = parseFloat(window.getComputedStyle(svg).getPropertyValue("font-size"));
        svgRootFontSizes.set(svg, fontSize);
    }
    return fontSize;
}

/**
 * Resolves the font size of an SVG element in px from inline styles only.
 * Inline px is used as is. Inline em and % are multiplied up to the SVG root,
 * whose computed font size is read once and cached.
 * Returns undefined when the font size cannot be resolved this way, and for detached elements,
 * where getComputedStyle returns an empty value.
 */
export function resolveInlineFontSize(element: any): number | undefined {
    if (!element?.isConnected) {
        return undefined;
    }
    let factor = 1;
    let node = element;
    while (node?.nodeType === 1) {
        if (node.nodeName === "svg") {
            const rootFontSize = getSvgRootFontSize(node);
            return Number.isNaN(rootFontSize) ? undefined : factor * rootFontSize;
        }
        const fontSize = node.style?.fontSize;
        if (fontSize) {
            const match = FONT_SIZE.exec(fontSize);
            if (!match) {
                return undefined;
            }
            const value = parseFloat(match[1]);
            if (match[2] === "px") {
                return factor * value;
            }
            factor *= match[2] === "em" ? value : value / 100;
        }
        node = node.parentNode;
    }
    return undefined;
}

/**
 * Highcharts reads font-size through getComputedStyle for each text element
 * (TextBuilder.buildSVG cache key, SVGRenderer.fontMetrics). Each read forces a synchronous
 * style recalculation because the SVG just changed. In non-styled mode Highcharts writes
 * the font size as an inline style, so resolve it from there and use getComputedStyle only as a fallback.
 */
export function inlineFontSize(Highcharts: any): void {
    Highcharts.wrap(
        Highcharts.SVGElement.prototype,
        "getStyle",
        function getStyle(this: any, proceed: any, prop: string) {
            // "this" is an SVGElement wrapper, or a DOM node when called via getStyle.call(node)
            if (prop === "font-size" && !this.renderer?.styledMode) {
                const fontSize = resolveInlineFontSize(this.element || this);
                if (fontSize !== undefined) {
                    return `${Math.round(fontSize * 1000) / 1000}px`;
                }
            }
            return proceed.call(this, prop);
        },
    );
}
