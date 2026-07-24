// (C) 2026 GoodData Corporation

import { createRef, useEffect, useMemo, useRef } from "react";

import type { EditorView } from "@codemirror/view";

import { useUiAutofocusConnectors } from "@gooddata/sdk-ui-kit";

export function useInputAutofocus(
    editorApi: EditorView | null,
    autofocus: boolean,
    opts: { isBusy: boolean },
) {
    // Force focus when autofocus is enables on the first mount, right after the initial state is loaded
    const forceFocusOnce = useRef<boolean>(autofocus);

    const initialFocus = useMemo(() => {
        const ref = createRef<HTMLDivElement>();
        ref.current = editorApi?.contentDOM as HTMLDivElement;
        return ref;
    }, [editorApi]);

    const ref = useUiAutofocusConnectors<HTMLDivElement>({
        initialFocus,
        active:
            autofocus && !opts.isBusy && (forceFocusOnce.current || document.activeElement === document.body),
        refocusKey: opts.isBusy,
    });

    useEffect(() => {
        if (document.activeElement === editorApi?.contentDOM) {
            forceFocusOnce.current = false;
        }
    }, [editorApi]);

    useEffect(
        () => () => {
            // When unmount occurred, reset the autofocus
            forceFocusOnce.current = true;
        },
        [],
    );

    return ref;
}
