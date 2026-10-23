// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { useEvents } from "../../../shared/eventing/useEvents.js";

import { events } from "./MaqlEditorField.events.js";

function shouldModifyHref(href: string) {
    return !href || href === "#" || href === `${location.origin}${location.pathname}#`;
}

/**
 *  monaco suggestion details links are processed with href=#, we need to change link to correct value, which is in data-href attribute
 *  https://github.com/microsoft/vscode/blob/1eaf52cfd50c05b93e73eb6e96046c23257018ad/src/vs/base/browser/markdownRenderer.ts#L159
 * @param element -
 */
function fixMonacoMarkdownAnchorHref(element: HTMLAnchorElement) {
    if (shouldModifyHref(element.href) && element.dataset["href"]) {
        const href = element.dataset["href"];
        element.setAttribute("href", href);
        element.href = href;
    }

    return element;
}

function eventTargetsToClassArray(eventTargets: EventTarget[]) {
    return (eventTargets as HTMLElement[])
        .map((element: HTMLElement) => element.classList)
        .map((list: DOMTokenList) => (list ? Array.from(list.values()) : []))
        .map((classArray: string[]) => classArray.join(" "));
}

function containsClasses(pathClasses: string[], ...classNames: string[]) {
    return classNames.every((className) => pathClasses.some((pathClass) => pathClass.includes(className)));
}

function isAnchorClickInSuggestDetails<T extends Event>(
    event: T,
): event is T & { target: HTMLAnchorElement } {
    if ((event.target as HTMLElement)?.tagName.toLowerCase() !== "a") {
        return false;
    }

    const pathClasses = eventTargetsToClassArray(event.composedPath());
    return containsClasses(pathClasses, "maql-editor", "suggest-details");
}

export function useDocumentationLinkProcessing(): (event: MouseEvent) => void {
    const { editorClickSuggestionDetailLinkEvent } = useEvents(events);

    return useCallback(
        (event) => {
            if (!isAnchorClickInSuggestDetails(event)) {
                return;
            }

            if (event.ctrlKey || event.metaKey) {
                fixMonacoMarkdownAnchorHref(event.target);
            }

            editorClickSuggestionDetailLinkEvent();
        },
        [editorClickSuggestionDetailLinkEvent],
    );
}

export function useDocumentationLinkContextMenuProcessing(): (event: MouseEvent) => void {
    return useCallback((event) => {
        if (!isAnchorClickInSuggestDetails(event)) {
            return;
        }

        const links = document.querySelectorAll(`a[data-href][href="#"]`);
        (Array.from(links) as HTMLAnchorElement[]).forEach(fixMonacoMarkdownAnchorHref);
    }, []);
}
