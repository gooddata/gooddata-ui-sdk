// (C) 2022-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { FormattedMessage, type MessageDescriptor, defineMessage } from "react-intl";

import { Message } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsNewDashboard } from "../../../model/store/meta/metaSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectDateFilterConfigValidationWarnings } from "../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { type DateFilterValidationResult } from "../../../types.js";

const workspaceValidationMessagesMapping: { [K in DateFilterValidationResult]?: MessageDescriptor } = {
    ConflictingIdentifiers: defineMessage({ id: "filters.config.warning.conflictingIdentifiers" }),
    NO_CONFIG: defineMessage({ id: "filters.config.warning.workspace.notAvailable" }),
    NoVisibleOptions: defineMessage({ id: "filters.config.warning.allOptionsHidden" }),
    SelectedOptionInvalid: defineMessage({ id: "filters.config.warning.selectedFilterNotValid" }),
    TOO_MANY_CONFIGS: defineMessage({ id: "filters.config.warning.multipleWorkspacesConfigs" }),
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

export function DateFilterConfigWarnings() {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const warnings = useDashboardSelector(selectRelevantWarnings);

    return isInEditMode && warnings.length > 0 ? (
        <Message type="warning" contrast className="gd-date-filter-config-warning-message">
            <ul className="gd-date-filter-config-warning-message-items">
                {warnings.map((warning) => {
                    const message = workspaceValidationMessagesMapping[warning];
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
}
