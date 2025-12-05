// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { EditorView, placeholder } from "@codemirror/view";

export interface IUseCodemirrorOptions {
    labelText?: string;
    placeholderText?: string;
}

export function useCodemirrorOptions({ placeholderText, labelText }: IUseCodemirrorOptions) {
    // Disable autofocus
    const disableAutofocusExtension = useMemo(
        () => EditorView.contentAttributes.of({ autofocus: "false" }),
        [],
    );

    // Placeholder
    const placeholderExtension = useMemo(() => {
        return placeholderText
            ? placeholder(() => {
                  const dom = document.createElement("span");
                  dom.textContent = placeholderText;
                  // Hide from screen readers
                  dom.setAttribute("aria-hidden", "true");
                  // Prevent default aria-label
                  dom.removeAttribute("aria-label");
                  return dom;
              })
            : [];
    }, [placeholderText]);

    // ARIA
    const ariaExtension = EditorView.contentAttributes.of({
        "aria-label": labelText ?? placeholderText ?? "",
        tabIndex: "0", // Ensure the input is focusable
    });

    return {
        disableAutofocusExtension,
        placeholderExtension,
        ariaExtension,
    };
}
