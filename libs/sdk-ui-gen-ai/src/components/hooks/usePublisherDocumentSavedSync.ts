// (C) 2026 GoodData Corporation

import { useEffect, useRef } from "react";

import { publisherDocumentSavedAction } from "../../store/messages/messagesSlice.js";

/**
 * A document of the chat that an application saved. `seq` tells one save from the next, so saving the
 * same document again is reported again.
 */
export interface IPublisherDocumentSaved {
    seq: number;
    conversationId: string;
    itemId: string;
    documentRef?: string;
    savedDocumentId: string;
}

/**
 * Tells the chat store about a document an application saved, so the document in the chat reads as saved
 * without the conversation being loaded again.
 */
export function usePublisherDocumentSavedSync(
    dispatch: ((action: ReturnType<typeof publisherDocumentSavedAction>) => void) | null,
    documentSaved: IPublisherDocumentSaved | undefined,
) {
    const lastSeq = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!dispatch || !documentSaved || lastSeq.current === documentSaved.seq) {
            return;
        }
        lastSeq.current = documentSaved.seq;
        const { seq: _seq, ...payload } = documentSaved;
        dispatch(publisherDocumentSavedAction(payload));
    }, [dispatch, documentSaved]);
}
