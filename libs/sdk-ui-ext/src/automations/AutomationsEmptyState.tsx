// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { UiAsyncTableEmptyState } from "@gooddata/sdk-ui-kit";

import { messages } from "./messages.js";
import { AutomationsType } from "./types.js";

interface IAutomationsEmptyStateProps {
    type: AutomationsType;
    isFiltersOrSearchActive: boolean;
}

export function AutomationsEmptyState({ type, isFiltersOrSearchActive }: IAutomationsEmptyStateProps) {
    const intl = useIntl();

    if (isFiltersOrSearchActive) {
        return <UiAsyncTableEmptyState />;
    }

    const emptyStateProps =
        type === "schedule"
            ? {
                  title: intl.formatMessage(messages.emptyStateScheduleTitle),
                  description: intl.formatMessage(messages.emptyStateScheduleDescription),
                  icon: "clock" as const,
              }
            : {
                  title: intl.formatMessage(messages.emptyStateAlertTitle),
                  description: intl.formatMessage(messages.emptyStateAlertDescription),
                  icon: "alert" as const,
              };

    return <UiAsyncTableEmptyState {...emptyStateProps} />;
}
