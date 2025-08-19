// (C) 2025 GoodData Corporation

import React from "react";

import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { AutomationsCore } from "./AutomationsCore.js";
import { DEFAULT_MAX_HEIGHT, DEFAULT_PAGE_SIZE } from "./constants.js";
import { FilterOptionsProvider } from "./filters/FilterOptionsContext.js";
import { IAutomationsProps } from "./types.js";
import { UserProvider } from "./UserContext.js";
import { defaultDashboardUrlBuilder, defaultEditAutomation, defaultWidgetUrlBuilder } from "./utils.js";
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
    preselectedFilters = {},
    maxHeight = DEFAULT_MAX_HEIGHT,
    pageSize = DEFAULT_PAGE_SIZE,
    type = "schedule",
    isSmall = false,
    dashboardUrlBuilder = defaultDashboardUrlBuilder,
    widgetUrlBuilder = defaultWidgetUrlBuilder,
    editAutomation = defaultEditAutomation,
}: IAutomationsProps) => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <UserProvider>
                    <FilterOptionsProvider>
                        <InternalIntlWrapper locale={locale} workspace={workspace}>
                            <AutomationsCore
                                selectedColumnDefinitions={selectedColumnDefinitions}
                                preselectedFilters={preselectedFilters}
                                type={type}
                                maxHeight={maxHeight}
                                pageSize={pageSize}
                                isSmall={isSmall}
                                dashboardUrlBuilder={dashboardUrlBuilder}
                                widgetUrlBuilder={widgetUrlBuilder}
                                editAutomation={editAutomation}
                            />
                        </InternalIntlWrapper>
                    </FilterOptionsProvider>
                </UserProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );
};
