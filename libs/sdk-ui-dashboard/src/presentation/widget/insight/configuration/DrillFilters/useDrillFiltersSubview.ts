// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { typedUiMenuContextStore } from "@gooddata/sdk-ui-kit";

import { messages } from "./messages.js";

const DRILL_FILTERS_SUBVIEW_PATH = "ignoredFilters";

export function useDrillFiltersSubview() {
    const intl = useIntl();
    const { useContextStore, createSelector } = typedUiMenuContextStore();
    const selector = createSelector((ctx) => ({
        pushShownSubview: ctx.pushShownSubview,
        shownSubview: ctx.shownSubview,
    }));
    const { pushShownSubview, shownSubview } = useContextStore(selector);

    const activeSubview = shownSubview.at(-1);
    const activeDrillItemLocalId =
        activeSubview?.path === DRILL_FILTERS_SUBVIEW_PATH
            ? (activeSubview.payload?.["drillItemLocalId"] as string | undefined)
            : undefined;

    return {
        activeDrillItemLocalId,
        openDrillFilters: (drillItemLocalId: string) =>
            pushShownSubview({
                path: DRILL_FILTERS_SUBVIEW_PATH,
                payload: {
                    drillItemLocalId,
                },
                title: intl.formatMessage(messages.drillFiltersSubviewTitle),
                tooltipText: intl.formatMessage(messages.drillFiltersSubviewTooltip),
            }),
    };
}
