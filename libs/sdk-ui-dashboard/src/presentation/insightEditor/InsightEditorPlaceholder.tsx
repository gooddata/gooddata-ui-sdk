// (C) 2022-2026 GoodData Corporation

import { useEffect } from "react";

import { useDashboardDispatch } from "../../model/react/DashboardStoreProvider.js";
import { uiActions } from "../../model/store/ui/index.js";
import { type IDashboardWidgetProps } from "../widget/widget/types.js";

/**
 * Takes the place of a new insight dropped in the layout. It opens the embedded Analytical Designer
 * to create the insight.
 */
export function InsightEditorPlaceholder(_props: IDashboardWidgetProps): null {
    const dispatch = useDashboardDispatch();
    useEffect(() => {
        dispatch(uiActions.openInsightEditor({ type: "placeholder" }));
    }, [dispatch]);

    return null;
}
