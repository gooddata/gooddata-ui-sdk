// (C) 2025 GoodData Corporation

import { BackendProvider, IntlWrapper, WorkspaceProvider } from "@gooddata/sdk-ui";
import React from "react";
import { AutomationsCore } from "./AutomationsCore.js";
import { FilterOptionsProvider } from "./filters/FilterOptionsContext.js";
import {
    DEFAULT_MAX_HEIGHT,
    DEFAULT_PAGE_SIZE,
    defaultAutomationUrlBuilder,
    defaultDashboardUrlBuilder,
    defaultWidgetUrlBuilder,
} from "./constants.js";
import { IAutomationsProps } from "./types.js";
import { UserProvider } from "./UserContext.js";

/**
 * Internal component for displaying automations.
 *
 * @internal
 */
export const Automations = ({
    backend,
    workspace,
    locale,
    selectedColumnDefinitions,
    maxHeight = DEFAULT_MAX_HEIGHT,
    pageSize = DEFAULT_PAGE_SIZE,
    type = "schedule",
    dashboardUrlBuilder = defaultDashboardUrlBuilder,
    automationUrlBuilder = defaultAutomationUrlBuilder,
    widgetUrlBuilder = defaultWidgetUrlBuilder,
}: IAutomationsProps) => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <UserProvider>
                    <FilterOptionsProvider>
                        <IntlWrapper locale={locale}>
                            <AutomationsCore
                                selectedColumnDefinitions={selectedColumnDefinitions}
                                type={type}
                                maxHeight={maxHeight}
                                pageSize={pageSize}
                                dashboardUrlBuilder={dashboardUrlBuilder}
                                automationUrlBuilder={automationUrlBuilder}
                                widgetUrlBuilder={widgetUrlBuilder}
                            />
                        </IntlWrapper>
                    </FilterOptionsProvider>
                </UserProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );
};
