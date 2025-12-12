// (C) 2025 GoodData Corporation
import { useCallback, useEffect, useState } from "react";

import { type AgGridEvent, type GridApi } from "ag-grid-community";

const WATCHING_TABLE_RENDERED_INTERVAL = 500;
export function useRenderWatcher(afterRender: (() => void) | undefined) {
    const [intervalId, setIntervalId] = useState(null);
    const onFirstDataRendered = useCallback(
        (event: AgGridEvent) => {
            // See CorePivotTable and https://github.com/ag-grid/ag-grid/issues/3263,
            const id = window.setInterval(() => {
                const ready = isPivotTableReady(event.api);
                if (ready) {
                    clearInterval(id);
                    afterRender?.();
                }
            }, WATCHING_TABLE_RENDERED_INTERVAL);
            setIntervalId(id);
        },
        [afterRender],
    );
    useEffect(() => {
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);

    return {
        onFirstDataRendered,
    };
}

function isPivotTableReady(api: GridApi | undefined): boolean {
    if (!api) {
        return false;
    }

    const tablePagesLoaded = () => {
        const pages = api.getCacheBlockState();
        return (
            pages &&
            Object.keys(pages).every(
                (pageId: string) =>
                    pages[pageId].pageStatus === "loaded" || pages[pageId].pageStatus === "failed",
            )
        );
    };

    return tablePagesLoaded();
}
