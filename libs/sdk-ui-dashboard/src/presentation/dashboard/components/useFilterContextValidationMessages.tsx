// (C) 2021-2025 GoodData Corporation

import { type ReactNode, useCallback, useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IMessage } from "@gooddata/sdk-ui-kit";

import {
    selectFilterValidationIncompatibleDefaultFiltersOverride,
    selectIsInExportMode,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

const commonReplacements = {
    b: (chunks: ReactNode) => <b>{chunks}</b>,
    i: (chunks: ReactNode) => <i>{chunks}</i>,
};

const localizationMessages = defineMessages({
    invalidDrillTitle: { id: "messages.dashboard.incompatibleDefaultFilters.title" },
});

const INCOMPATIBLE_DEFAULT_FILTERS_MESSAGE_ID = "incompatible_default_filters_message";

export function useFilterContextValidationMessages() {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();

    const incompatibleDefaultFiltersOverride = useDashboardSelector(
        selectFilterValidationIncompatibleDefaultFiltersOverride,
    );
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    const messages = useMemo((): IMessage[] => {
        if (!incompatibleDefaultFiltersOverride || isExportMode) {
            return [];
        }

        return [
            {
                id: INCOMPATIBLE_DEFAULT_FILTERS_MESSAGE_ID,
                type: "warning",
                node: intl.formatMessage(localizationMessages.invalidDrillTitle, commonReplacements),
                createdAt: new Date().getTime(),
                duration: Infinity,
            },
        ] satisfies IMessage[];
    }, [incompatibleDefaultFiltersOverride, isExportMode, intl]);

    const removeMessage = useCallback(
        (id: string) => {
            if (id === INCOMPATIBLE_DEFAULT_FILTERS_MESSAGE_ID) {
                dispatch(uiActions.resetIncompatibleDefaultFiltersOverrideMessage());
            }
        },
        [dispatch],
    );

    const removeAllMessages = useCallback(() => {
        dispatch(uiActions.resetIncompatibleDefaultFiltersOverrideMessage());
    }, [dispatch]);

    return {
        messages,
        removeMessage,
        removeAllMessages,
    };
}
