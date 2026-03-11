// (C) 2021-2026 GoodData Corporation

import { type ReactNode, useCallback, useMemo } from "react";

import { compact } from "lodash-es";
import { defineMessages, useIntl } from "react-intl";

import { isWidget, widgetTitle } from "@gooddata/sdk-model";
import { type IMessage } from "@gooddata/sdk-ui-kit";

import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectWidgetsMap } from "../../../model/store/tabs/layout/layoutSelectors.js";
import { uiActions } from "../../../model/store/ui/index.js";
import {
    selectInvalidDrillWidgetRefs,
    selectInvalidUrlDrillParameterWidgetWarnings,
    selectSanitizedDrillWidgetRefs,
} from "../../../model/store/ui/uiSelectors.js";

const commonReplacements = {
    b: (chunks: ReactNode) => <b>{chunks}</b>,
    i: (chunks: ReactNode) => <i>{chunks}</i>,
};

const localizationMessages = defineMessages({
    invalidDrillTitle: { id: "messages.dashboard.invalidDrills.title" },
    invalidDrillBody: { id: "messages.dashboard.invalidDrills.body.modern" },
    sanitizedDrillTitle: { id: "messages.dashboard.sanitizedDrills.title" },
    sanitizedDrillBody: { id: "messages.dashboard.sanitizedDrills.body.modern" },
    invalidUrlDrillTitle: { id: "messages.dashboard.invalidCustomUrlDrills.title" },
    invalidUrlDrillBody: { id: "messages.dashboard.invalidCustomUrlDrills.body.modern" },
    showMore: { id: "messages.dashboard.expandable.showMore" },
    showLess: { id: "messages.dashboard.expandable.showLess" },
});

const DRILL_MESSAGE_ID = "invalid_drill_message";
const SANITIZED_DRILL_MESSAGE_ID = "sanitized_drill_message";
const URL_DRILL_MESSAGE_ID = "invalid_url_drill_message";

export function useDrillValidationMessages() {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();

    const allWidgets = useDashboardSelector(selectWidgetsMap);
    const invalidDrillWidgetRefs = useDashboardSelector(selectInvalidDrillWidgetRefs);
    const sanitizedDrillWidgetRefs = useDashboardSelector(selectSanitizedDrillWidgetRefs);
    const invalidUrlDrillWidgetRefs = useDashboardSelector(selectInvalidUrlDrillParameterWidgetWarnings);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const messages = useMemo(() => {
        if (!isInEditMode) {
            return [];
        }

        const invalidDrillWidgets = compact(
            invalidDrillWidgetRefs.map((ref) => allWidgets.get(ref)).filter(isWidget),
        );
        const sanitizedDrillWidgets = compact(
            sanitizedDrillWidgetRefs.map((ref) => allWidgets.get(ref)).filter(isWidget),
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
            sanitizedDrillWidgets.length > 0 &&
                ({
                    id: SANITIZED_DRILL_MESSAGE_ID,
                    type: "warning",
                    node: intl.formatMessage(localizationMessages.sanitizedDrillTitle, commonReplacements),
                    errorDetail: intl.formatMessage(localizationMessages.sanitizedDrillBody, {
                        listOfWidgetTitles: sanitizedDrillWidgets.map(widgetTitle).join(", "),
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
    }, [
        isInEditMode,
        invalidDrillWidgetRefs,
        sanitizedDrillWidgetRefs,
        invalidUrlDrillWidgetRefs,
        intl,
        allWidgets,
    ]);

    const removeMessage = useCallback(
        (id: string) => {
            if (id === DRILL_MESSAGE_ID) {
                dispatch(uiActions.resetInvalidDrillWidgetRefs());
            }
            if (id === SANITIZED_DRILL_MESSAGE_ID) {
                dispatch(uiActions.resetSanitizedDrillWidgetRefs());
            }
            if (id === URL_DRILL_MESSAGE_ID) {
                dispatch(uiActions.resetAllInvalidCustomUrlDrillParameterWidgetsWarnings());
            }
        },
        [dispatch],
    );

    const removeAllMessages = useCallback(() => {
        dispatch(uiActions.resetInvalidDrillWidgetRefs());
        dispatch(uiActions.resetSanitizedDrillWidgetRefs());
        dispatch(uiActions.resetAllInvalidCustomUrlDrillParameterWidgetsWarnings());
    }, [dispatch]);

    return {
        messages,
        removeMessage,
        removeAllMessages,
    };
}
