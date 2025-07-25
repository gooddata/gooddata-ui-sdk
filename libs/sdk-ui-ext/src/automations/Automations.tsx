// (C) 2025 GoodData Corporation

import { BackendProvider, IntlWrapper, WorkspaceProvider } from "@gooddata/sdk-ui";
import React from "react";
import { AutomationsCore } from "./AutomationsCore.js";
import { FilterOptionsProvider } from "./filters/FilterOptionsContext.js";
import { DEFAULT_MAX_HEIGHT, DEFAULT_PAGE_SIZE } from "./constants.js";
import { IAutomationsProps } from "./types.js";

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
}: IAutomationsProps) => {
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
