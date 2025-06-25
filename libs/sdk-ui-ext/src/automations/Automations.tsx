// (C) 2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, IntlWrapper, WorkspaceProvider } from "@gooddata/sdk-ui";
import React from "react";
import { AutomationsCore } from "./AutomationsCore.js";
import { FilterOptionsProvider } from "./filters/FilterOptionsContext.js";
import { AutomationColumnDefinition, AutomationsType } from "./types.js";
import { DEFAULT_MAX_HEIGHT, DEFAULT_PAGE_SIZE } from "./constants.js";

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
}: {
    backend?: IAnalyticalBackend;
    workspace?: string;
    locale?: string;
    selectedColumnDefinitions?: Array<AutomationColumnDefinition>;
    maxHeight?: number;
    pageSize?: number;
    type?: AutomationsType;
}) => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <FilterOptionsProvider>
                    <IntlWrapper locale={locale}>
                        <AutomationsCore
                            selectedColumnDefinitions={selectedColumnDefinitions}
                            type={type}
                            maxHeight={maxHeight}
                            pageSize={pageSize}
                        />
                    </IntlWrapper>
                </FilterOptionsProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );
};
