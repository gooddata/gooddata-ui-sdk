// (C) 2022 GoodData Corporation
import React from "react";
import { defineMessage, FormattedMessage, MessageDescriptor } from "react-intl";
import { Message } from "@gooddata/sdk-ui-kit";

import {
    selectDateFilterConfigValidationWarnings,
    selectEnableRenamingProjectToWorkspace,
    selectIsInEditMode,
    useDashboardSelector,
} from "../../../model";
import { DateFilterValidationResult } from "../../../types";

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

export const DateFilterConfigWarnings: React.FC = () => {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const warnings = useDashboardSelector(selectDateFilterConfigValidationWarnings);
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
