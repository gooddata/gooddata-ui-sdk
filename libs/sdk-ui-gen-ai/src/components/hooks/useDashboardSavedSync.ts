// (C) 2026 GoodData Corporation

import { useEffect, useRef } from "react";

import { dashboardSavedAction } from "../../store/messages/messagesSlice.js";

export interface IDashboardSaved {
    seq: number;
    conversationId: string;
    originalDashboardId: string;
    savedDashboardId: string;
    savedInsights: ReadonlyArray<{
        originalInsightId: string;
        savedInsightId: string;
    }>;
}

export function useDashboardSavedSync(
    dispatch: ((action: ReturnType<typeof dashboardSavedAction>) => void) | null,
    dashboardSaved: IDashboardSaved | undefined,
) {
    const lastSeq = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!dispatch || !dashboardSaved || lastSeq.current === dashboardSaved.seq) {
            return;
        }
        lastSeq.current = dashboardSaved.seq;
        const { seq: _seq, ...payload } = dashboardSaved;
        dispatch(dashboardSavedAction(payload));
    }, [dashboardSaved, dispatch]);
}
