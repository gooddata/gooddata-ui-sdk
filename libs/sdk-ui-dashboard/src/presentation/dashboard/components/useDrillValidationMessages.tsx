// (C) 2021-2025 GoodData Corporation
import React, { useCallback, useMemo } from "react";

import compact from "lodash/compact.js";
import { defineMessages, useIntl } from "react-intl";

import { isWidget, widgetTitle } from "@gooddata/sdk-model";
import { IMessage } from "@gooddata/sdk-ui-kit";

import {
    selectInvalidDrillWidgetRefs,
    selectInvalidUrlDrillParameterWidgetWarnings,
    selectIsInEditMode,
    selectWidgetsMap,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

const commonReplacements = {
    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
    i: (chunks: React.ReactNode) => <i>{chunks}</i>,
};

const localizationMessages = defineMessages({
    invalidDrillTitle: { id: "messages.dashboard.invalidDrills.title" },
    invalidDrillBody: { id: "messages.dashboard.invalidDrills.body.modern" },
    invalidUrlDrillTitle: { id: "messages.dashboard.invalidCustomUrlDrills.title" },
    invalidUrlDrillBody: { id: "messages.dashboard.invalidCustomUrlDrills.body.modern" },
    showMore: { id: "messages.dashboard.expandable.showMore" },
    showLess: { id: "messages.dashboard.expandable.showLess" },
});

const DRILL_MESSAGE_ID = "invalid_drill_message";
const URL_DRILL_MESSAGE_ID = "invalid_url_drill_message";

export function useDrillValidationMessages() {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();

    const allWidgets = useDashboardSelector(selectWidgetsMap);
    const invalidDrillWidgetRefs = useDashboardSelector(selectInvalidDrillWidgetRefs);
    const invalidUrlDrillWidgetRefs = useDashboardSelector(selectInvalidUrlDrillParameterWidgetWarnings);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const messages = useMemo(() => {
        if (!isInEditMode) {
            return [];
        }

        const invalidDrillWidgets = compact(
            invalidDrillWidgetRefs.map((ref) => allWidgets.get(ref)).filter(isWidget),
        );
        const invalidUrlDrillWidgets = compact(
            invalidUrlDrillWidgetRefs.map((ref) => allWidgets.get(ref)).filter(isWidget),
        );

        return compact<IMessage>([
            invalidDrillWidgets.length > 0 &&
                ({
                    id: DRILL_MESSAGE_ID,
                    type: "warning",
                    node: intl.formatMessage(localizationMessages.invalidDrillTitle, commonReplacements),
                    errorDetail: intl.formatMessage(localizationMessages.invalidDrillBody, {
                        listOfWidgetTitles: invalidDrillWidgets.map(widgetTitle).join(", "),
                        ...commonReplacements,
                    }) as any, // IMessage typings are wrong
                    showMore: intl.formatMessage(localizationMessages.showMore),
                    showLess: intl.formatMessage(localizationMessages.showLess),
                    createdAt: new Date().getTime(),
                    duration: Infinity,
                } satisfies IMessage),
            invalidUrlDrillWidgets.length > 0 &&
                ({
                    id: URL_DRILL_MESSAGE_ID,
                    type: "warning",
                    node: intl.formatMessage(localizationMessages.invalidUrlDrillTitle, commonReplacements),
                    errorDetail: intl.formatMessage(localizationMessages.invalidUrlDrillBody, {
                        listOfWidgetTitles: invalidUrlDrillWidgets.map(widgetTitle).join(", "),
                        ...commonReplacements,
                    }) as any, // IMessage typings are wrong
                    showMore: intl.formatMessage(localizationMessages.showMore),
                    showLess: intl.formatMessage(localizationMessages.showLess),
                    createdAt: new Date().getTime(),
                    duration: Infinity,
                } satisfies IMessage),
        ]);
    }, [isInEditMode, invalidDrillWidgetRefs, invalidUrlDrillWidgetRefs, intl, allWidgets]);

    const removeMessage = useCallback(
        (id: string) => {
            if (id === DRILL_MESSAGE_ID) {
                dispatch(uiActions.resetInvalidDrillWidgetRefs());
            }
            if (id === URL_DRILL_MESSAGE_ID) {
                dispatch(uiActions.resetAllInvalidCustomUrlDrillParameterWidgetsWarnings());
            }
        },
        [dispatch],
    );

    const removeAllMessages = useCallback(() => {
        dispatch(uiActions.resetInvalidDrillWidgetRefs());
        dispatch(uiActions.resetAllInvalidCustomUrlDrillParameterWidgetsWarnings());
    }, [dispatch]);

    return {
        messages,
        removeMessage,
        removeAllMessages,
    };
}
