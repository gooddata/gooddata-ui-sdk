// (C) 2026 GoodData Corporation

import { type ComponentProps } from "react";

import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import Markdown from "react-markdown";

export interface IRenderedMarkdown {
    dom: HTMLElement;
    destroy: () => void;
}

const components = {
    a: (props: ComponentProps<"a">) => <a {...props} target="_blank" rel="noreferrer" />,
};

/**
 * Renders markdown into a detached element, for the places CodeMirror takes a DOM node rather than
 * React children: completion documentation and hover tooltips. Rendered synchronously so the node has
 * its size when CodeMirror measures it.
 */
export function renderMarkdown(markdown: string, className: string): IRenderedMarkdown {
    const dom = document.createElement("div");
    dom.className = className;

    const root = createRoot(dom);
    flushSync(() => {
        root.render(<Markdown components={components}>{markdown}</Markdown>);
    });

    return {
        dom,
        destroy: () => {
            // Unmount outside the CodeMirror update that destroys the tooltip, as React refuses
            // synchronous unmounts while another render may be in progress.
            setTimeout(() => root.unmount(), 0);
        },
    };
}
