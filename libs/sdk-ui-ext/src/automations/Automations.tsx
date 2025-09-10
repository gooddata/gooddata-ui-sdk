// (C) 2025 GoodData Corporation

import React from "react";

import {
    BackendProvider,
    OrganizationProvider,
    WorkspaceProvider,
    buildDashboardUrl,
    buildWidgetUrl,
} from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { AutomationsCore } from "./AutomationsCore.js";
import { DEFAULT_MAX_HEIGHT, DEFAULT_PAGE_SIZE } from "./constants.js";
import { FilterOptionsProvider } from "./filters/FilterOptionsContext.js";
import { IAutomationsProps } from "./types.js";
import { UserProvider } from "./UserContext.js";
import { defaultEditAutomation } from "./utils.js";
import { InternalIntlWrapper } from "../internal/utils/internalIntlProvider.js";

/**
 * Internal component for displaying automations.
 *
 * @internal
 */
export function Automations({
    backend,
    scope,
    workspace,
    organization,
    locale = "en-US",
    timezone = "UTC",
    selectedColumnDefinitions,
    preselectedFilters = {},
    maxHeight = DEFAULT_MAX_HEIGHT,
    pageSize = DEFAULT_PAGE_SIZE,
    type = "schedule",
    isSmall = false,
    invalidateItemsRef,
    dashboardUrlBuilder = buildDashboardUrl,
    widgetUrlBuilder = buildWidgetUrl,
    editAutomation = defaultEditAutomation,
}: IAutomationsProps) {
    return (
        <BackendProvider backend={backend}>
            <OrganizationProvider organization={organization}>
                <WorkspaceProvider workspace={workspace}>
                    <UserProvider scope={scope}>
                        <FilterOptionsProvider scope={scope}>
                            <InternalIntlWrapper locale={locale} workspace={workspace}>
                                <ToastsCenterContextProvider>
                                    <AutomationsCore
                                        selectedColumnDefinitions={selectedColumnDefinitions}
                                        preselectedFilters={preselectedFilters}
                                        type={type}
                                        scope={scope}
                                        timezone={timezone}
                                        maxHeight={maxHeight}
                                        pageSize={pageSize}
                                        isSmall={isSmall}
                                        dashboardUrlBuilder={dashboardUrlBuilder}
                                        widgetUrlBuilder={widgetUrlBuilder}
                                        editAutomation={editAutomation}
                                        invalidateItemsRef={invalidateItemsRef}
                                    />
                                </ToastsCenterContextProvider>
                            </InternalIntlWrapper>
                        </FilterOptionsProvider>
                    </UserProvider>
                </WorkspaceProvider>
            </OrganizationProvider>
        </BackendProvider>
    );
}
