// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";
import { Messages, IMessage } from "@gooddata/sdk-ui-kit";
import compact from "lodash/compact";
import {
    selectInvalidDrillWidgetRefs,
    selectInvalidUrlDrillWidgetRefs,
    selectIsInEditMode,
    selectWidgetsMap,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { isWidget, widgetTitle } from "@gooddata/sdk-model";

const commonReplacements = {
    b: (chunks: string) => <b>{chunks}</b>,
    i: (chunks: string) => <i>{chunks}</i>,
};

const localizationMessages = defineMessages({
    invalidDrillTitle: { id: "messages.dashboard.invalidDrills.title" },
    invalidDrillBody: { id: "messages.dashboard.invalidDrills.body" },
    invalidUrlDrillTitle: { id: "messages.dashboard.invalidCustomUrlDrills.title" },
    invalidUrlDrillBody: { id: "messages.dashboard.invalidCustomUrlDrills.body" },
    showMore: { id: "messages.dashboard.expandable.showMore" },
    showLess: { id: "messages.dashboard.expandable.showLess" },
});

const DRILL_MESSAGE_ID = "invalid_drill_message";
const URL_DRILL_MESSAGE_ID = "invalid_url_drill_message";

function useDrillValidationMessages(): { messages: IMessage[]; onMessageClose: (id: string) => void } {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();

    const allWidgets = useDashboardSelector(selectWidgetsMap);
    const invalidDrillWidgetRefs = useDashboardSelector(selectInvalidDrillWidgetRefs);
    const invalidUrlDrillWidgetRefs = useDashboardSelector(selectInvalidUrlDrillWidgetRefs);

    const invalidDrillWidgets = compact(
        invalidDrillWidgetRefs.map((ref) => allWidgets.get(ref)).filter(isWidget),
    );
    const invalidUrlDrillWidgets = compact(
        invalidUrlDrillWidgetRefs.map((ref) => allWidgets.get(ref)).filter(isWidget),
    );

    const messages = compact<IMessage>([
        invalidDrillWidgets.length > 0 && {
            id: DRILL_MESSAGE_ID,
            type: "warning",
            node: intl.formatMessage(localizationMessages.invalidDrillTitle, commonReplacements),
            errorDetail: intl.formatMessage(localizationMessages.invalidDrillBody, {
                listOfWidgetTitles: invalidDrillWidgets.map(widgetTitle).join(", "),
                ...commonReplacements,
            }) as any, // IMessage typings are wrong
            showMore: intl.formatMessage(localizationMessages.showMore),
            showLess: intl.formatMessage(localizationMessages.showLess),
        },
        invalidUrlDrillWidgets.length > 0 && {
            id: URL_DRILL_MESSAGE_ID,
            type: "warning",
            node: intl.formatMessage(localizationMessages.invalidUrlDrillTitle, commonReplacements),
            errorDetail: intl.formatMessage(localizationMessages.invalidUrlDrillBody, {
                listOfWidgetTitles: invalidUrlDrillWidgets.map(widgetTitle).join(", "),
                ...commonReplacements,
            }) as any, // IMessage typings are wrong
            showMore: intl.formatMessage(localizationMessages.showMore),
            showLess: intl.formatMessage(localizationMessages.showLess),
        },
    ]);

    const onMessageClose = useCallback(
        (id: string) => {
            if (id === DRILL_MESSAGE_ID) {
                dispatch(uiActions.setInvalidDrillWidgetRefs([]));
            }
            if (id === URL_DRILL_MESSAGE_ID) {
                dispatch(uiActions.setInvalidUrlDrillWidgetRefs([]));
            }
        },
        [dispatch],
    );

    return {
        messages,
        onMessageClose,
    };
}

/**
 * @internal
 */
export const DrillValidationToastMessages: React.FC = () => {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const { messages, onMessageClose } = useDrillValidationMessages();

    if (isInEditMode && messages.length > 0) {
        return <Messages messages={messages} onMessageClose={onMessageClose} />;
    }
    return null;
};
