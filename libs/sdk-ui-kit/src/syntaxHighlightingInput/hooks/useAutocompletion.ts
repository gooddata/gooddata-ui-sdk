// (C) 2025 GoodData Corporation
import { MutableRefObject, useMemo } from "react";

import {
    CompletionSource,
    autocompletion,
    completionStatus,
    selectedCompletionIndex,
    setSelectedCompletion,
} from "@codemirror/autocomplete";
import { EditorView, ViewPlugin } from "@codemirror/view";

export function useAutocompletion({
    handleCompletion,
    aboveCursor,
    whenTyping,
    activateOnTypingDelay,
}: {
    handleCompletion: MutableRefObject<CompletionSource>;
    aboveCursor?: boolean;
    whenTyping?: boolean;
    activateOnTypingDelay?: number;
}) {
    const autocompletionExtension = useMemo(() => {
        return autocompletion({
            override: handleCompletion.current
                ? [
                      (context) => {
                          return handleCompletion.current(context);
                      },
                  ]
                : [],
            activateOnTyping: whenTyping && Boolean(handleCompletion.current),
            activateOnTypingDelay,
            aboveCursor,
        });
    }, [handleCompletion, aboveCursor, whenTyping, activateOnTypingDelay]);

    const autocompleteHoverExtension = useMemo(() => {
        return ViewPlugin.fromClass(
            class {
                constructor(readonly view: EditorView) {
                    this.attachMouseListeners();
                }

                attachMouseListeners() {
                    const el = this.view.dom;
                    el.addEventListener("mousemove", this.onMouseMove);
                }

                onMouseMove = (event: MouseEvent) => {
                    const target = event.target as HTMLElement;

                    // Check if the completion menu is open
                    const open = completionStatus(this.view.state);
                    if (open !== "active") {
                        return;
                    }

                    // Matches autocomplete items (CM uses class `cm-completionLabel`, can vary with themes)
                    const itemEl = target.closest(".cm-completionLabel");
                    if (!itemEl) {
                        return;
                    }

                    const itemElement = itemEl.parentElement;
                    const parentElement = itemElement?.parentElement;
                    if (itemElement && parentElement) {
                        const children = Array.from(parentElement.children);
                        const index = children.indexOf(itemElement);
                        const selected = selectedCompletionIndex(this.view.state);
                        if (selected !== index) {
                            this.view.dispatch({
                                effects: setSelectedCompletion(index),
                            });
                        }
                    }
                };

                destroy() {
                    this.view.dom.removeEventListener("mousemove", this.onMouseMove);
                }
            },
        );
    }, []);

    return {
        autocompletionExtension,
        autocompleteHoverExtension,
    };
}
