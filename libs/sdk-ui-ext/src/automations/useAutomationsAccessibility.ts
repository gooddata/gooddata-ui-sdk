// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { type UiAsyncTableAccessibilityConfig } from "@gooddata/sdk-ui-kit";

import { messages } from "./messages.js";
import { type AutomationsType } from "./types.js";

export function useAutomationsAccessibility(type: AutomationsType) {
    const intl = useIntl();

    const accessibilityConfig: UiAsyncTableAccessibilityConfig<IAutomationMetadataObject> = useMemo(() => {
        const isAlert = type === "alert";

        return {
            checkboxAllAriaLabel: intl.formatMessage(
                isAlert ? messages.accessibilitySelectAllAlerts : messages.accessibilitySelectAllSchedules,
            ),
            searchAriaLabel: intl.formatMessage(
                isAlert ? messages.accessibilitySearchAlerts : messages.accessibilitySearchSchedules,
            ),
            getCheckboxItemAriaLabel: (automation: IAutomationMetadataObject) => {
                const title = automation.title || automation.id;
                return intl.formatMessage(
                    isAlert ? messages.accessibilitySelectAlert : messages.accessibilitySelectSchedule,
                    { title },
                );
            },
            gridAriaLabel: intl.formatMessage(
                isAlert ? messages.accessibilityGridLabelAlerts : messages.accessibilityGridLabelSchedules,
            ),
        };
    }, [type, intl]);

    return {
        accessibilityConfig,
    };
}
