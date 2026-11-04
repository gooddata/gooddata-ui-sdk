// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { useEvents } from "../../../shared/eventing/useEvents.js";

import { events } from "./MaqlEditorField.events.js";

function eventTargetsToClassArray(eventTargets: EventTarget[]) {
    return (eventTargets as HTMLElement[])
        .map((element: HTMLElement) => element.classList)
        .map((list: DOMTokenList) => (list ? Array.from(list.values()) : []))
        .map((classArray: string[]) => classArray.join(" "));
}

function containsClasses(pathClasses: string[], ...classNames: string[]) {
    return classNames.every((className) => pathClasses.some((pathClass) => pathClass.includes(className)));
}

/**
 * Whether the click landed on a link in the documentation of a suggestion of the MAQL editor.
 */
function isAnchorClickInSuggestDetails<T extends Event>(
    event: T,
): event is T & { target: HTMLAnchorElement } {
    if ((event.target as HTMLElement)?.tagName.toLowerCase() !== "a") {
        return false;
    }

    const pathClasses = eventTargetsToClassArray(event.composedPath());
    return containsClasses(pathClasses, "maql-editor", "cm-completionInfo");
}

export function useDocumentationLinkProcessing(): (event: MouseEvent) => void {
    const { editorClickSuggestionDetailLinkEvent } = useEvents(events);

    return useCallback(
        (event) => {
            if (!isAnchorClickInSuggestDetails(event)) {
                return;
            }

            editorClickSuggestionDetailLinkEvent();
        },
        [editorClickSuggestionDetailLinkEvent],
    );
}
