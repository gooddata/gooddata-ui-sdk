// (C) 2026 GoodData Corporation

import { useEffect, useRef } from "react";

import { reportSavedAction } from "../../store/messages/messagesSlice.js";

/**
 * A report of the chat that an application saved. `seq` tells one save from the next, so saving the
 * same report again is reported again.
 */
export interface IReportSaved {
    seq: number;
    conversationId: string;
    itemId: string;
    reportRef?: string;
    savedReportId: string;
}

/**
 * Tells the chat store about a report an application saved, so the report in the chat reads as saved
 * without the conversation being loaded again.
 */
export function useReportSavedSync(
    dispatch: ((action: ReturnType<typeof reportSavedAction>) => void) | null,
    reportSaved: IReportSaved | undefined,
) {
    const lastSeq = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!dispatch || !reportSaved || lastSeq.current === reportSaved.seq) {
            return;
        }
        lastSeq.current = reportSaved.seq;
        const { seq: _seq, ...payload } = reportSaved;
        dispatch(reportSavedAction(payload));
    }, [dispatch, reportSaved]);
}
