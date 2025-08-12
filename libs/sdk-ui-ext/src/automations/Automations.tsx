// (C) 2025 GoodData Corporation

import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
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
import { InternalIntlWrapper } from "../internal/utils/internalIntlProvider.js";

/**
 * Internal component for displaying automations.
 *
 * @internal
 */
export const Automations = ({
    backend,
    workspace,
    locale = "en-US",
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
                        <InternalIntlWrapper locale={locale} workspace={workspace}>
                            <AutomationsCore
                                selectedColumnDefinitions={selectedColumnDefinitions}
                                type={type}
                                maxHeight={maxHeight}
                                pageSize={pageSize}
                                dashboardUrlBuilder={dashboardUrlBuilder}
                                automationUrlBuilder={automationUrlBuilder}
                                widgetUrlBuilder={widgetUrlBuilder}
                            />
                        </InternalIntlWrapper>
                    </FilterOptionsProvider>
                </UserProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );
};
