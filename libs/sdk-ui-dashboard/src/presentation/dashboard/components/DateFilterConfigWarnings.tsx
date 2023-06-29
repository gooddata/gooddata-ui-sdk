// (C) 2022 GoodData Corporation
import React from "react";
import { defineMessage, FormattedMessage, MessageDescriptor } from "react-intl";
import { createSelector } from "@reduxjs/toolkit";
import { Message } from "@gooddata/sdk-ui-kit";

import {
    selectDateFilterConfigValidationWarnings,
    selectEnableRenamingProjectToWorkspace,
    selectIsInEditMode,
    selectIsNewDashboard,
    useDashboardSelector,
} from "../../../model/index.js";
import { DateFilterValidationResult } from "../../../types.js";

const workspaceValidationMessagesMapping: { [K in DateFilterValidationResult]?: MessageDescriptor } = {
    ConflictingIdentifiers: defineMessage({ id: "filters.config.warning.conflictingIdentifiers" }),
    NO_CONFIG: defineMessage({ id: "filters.config.warning.workspace.notAvailable" }),
    NoVisibleOptions: defineMessage({ id: "filters.config.warning.allOptionsHidden" }),
    SelectedOptionInvalid: defineMessage({ id: "filters.config.warning.selectedFilterNotValid" }),
    TOO_MANY_CONFIGS: defineMessage({ id: "filters.config.warning.multipleWorkspacesConfigs" }),
};

const projectValidationMessagesMapping: { [K in DateFilterValidationResult]?: MessageDescriptor } = {
    ...workspaceValidationMessagesMapping,
    NO_CONFIG: defineMessage({ id: "filters.config.warning.notAvailable" }),
    TOO_MANY_CONFIGS: defineMessage({ id: "filters.config.warning.multipleProjectConfigs" }),
};

// Some warnings make sense only when creating a new dashboard, for existing dashboards they are irrelevant
// because existing dashboard just has some option selected anyway.
const validationsRelevantToNewDashboardOnly = new Set<DateFilterValidationResult>([
    "NoVisibleOptions",
    "SelectedOptionInvalid",
]);

const selectRelevantWarnings = createSelector(
    selectDateFilterConfigValidationWarnings,
    selectIsNewDashboard,
    (warnings, isNew) => {
        return isNew
            ? warnings
            : warnings.filter((warning) => !validationsRelevantToNewDashboardOnly.has(warning));
    },
);

export const DateFilterConfigWarnings: React.FC = () => {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const warnings = useDashboardSelector(selectRelevantWarnings);
    const enableRenamingProjectToWorkspace = useDashboardSelector(selectEnableRenamingProjectToWorkspace);

    const effectiveMapping = enableRenamingProjectToWorkspace
        ? workspaceValidationMessagesMapping
        : projectValidationMessagesMapping;

    return isInEditMode && warnings.length > 0 ? (
        <Message type="warning" contrast={true} className="gd-date-filter-config-warning-message">
            <ul className="gd-date-filter-config-warning-message-items">
                {warnings.map((warning) => {
                    const message = effectiveMapping[warning];
                    if (message) {
                        return (
                            <li key={warning}>
                                <FormattedMessage id={message.id} />
                            </li>
                        );
                    }
                    return null;
                })}
            </ul>
        </Message>
    ) : null;
};
