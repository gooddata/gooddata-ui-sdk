// (C) 2026 GoodData Corporation

import { createRef, useEffect, useMemo, useRef } from "react";

import type { EditorView } from "@codemirror/view";
import { useSelector } from "react-redux";

import { useUiAutofocusConnectors } from "@gooddata/sdk-ui-kit";

import { conversationSelector } from "../../store/messages/messagesSelectors.js";

export function useInputAutofocus(
    editorApi: EditorView | null,
    autofocus: boolean,
    opts: { isBusy: boolean; refocusKey: number },
) {
    // Force focus when autofocus is enables on the first mount, right after the initial state is loaded
    const forceFocusOnce = useRef<boolean>(autofocus);
    useEffect(() => {
        forceFocusOnce.current = autofocus;
    }, [autofocus]);

    const conversationLocalId = useSelector(conversationSelector)?.localId;
    const focusedConversationLocalId = useRef(conversationLocalId);
    const refocusKeyRef = useRef(opts.refocusKey);

    const initialFocus = useMemo(() => {
        const ref = createRef<HTMLDivElement>();
        ref.current = editorApi?.contentDOM as HTMLDivElement;
        return ref;
    }, [editorApi]);

    const active =
        autofocus &&
        !opts.isBusy &&
        (forceFocusOnce.current ||
            document.activeElement === document.body ||
            focusedConversationLocalId.current !== conversationLocalId ||
            refocusKeyRef.current !== opts.refocusKey);

    const ref = useUiAutofocusConnectors<HTMLDivElement>({
        initialFocus,
        active: active,
        refocusKey: `${opts.isBusy}-${opts.refocusKey}-${conversationLocalId ?? ""}`,
    });

    useEffect(() => {
        if (document.activeElement === editorApi?.contentDOM) {
            forceFocusOnce.current = false;
        }
    }, [editorApi]);

    useEffect(() => {
        focusedConversationLocalId.current = conversationLocalId;
    }, [conversationLocalId]);
    useEffect(() => {
        refocusKeyRef.current = opts.refocusKey;
    }, [opts.refocusKey]);

    useEffect(
        () => () => {
            // When unmount occurred, reset the autofocus
            forceFocusOnce.current = true;
        },
        [],
    );

    return ref;
}
