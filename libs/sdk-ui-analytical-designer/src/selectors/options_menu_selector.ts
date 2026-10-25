// (C) 2007-2026 GoodData Corporation

import { type IntlShape, defineMessages } from "react-intl";
import { createSelector } from "reselect";

import { TABLE } from "../constants/visualization_types.js";
import { isExportConfigSupported } from "../services/buckets_service.js";
import { getVisualizationClassTypeFromState } from "../services/visualization_class_service.js";

import { supportsExportToCsv, supportsExportToXlsx } from "./backend_capabilities_selector.js";
import { AVAILABLE_HIDDEN_ACTIONS, hiddenActions } from "./editor_header_selector.js";
import {
    getIsReportEmpty,
    hasExportErrorExceptTooLarge,
    hasReportError,
    isReportOpening,
    isReportSaving,
} from "./export_selector.js";
import { enableRawExports } from "./feature_flag_selector.js";
import { getIsEmbedded } from "./meta_selector.js";
import { canExecuteRaw, canExportTabular } from "./permissions_selector.js";
import {
    hasNegativeValueSelector,
    isReportTooLargeSelector,
    isUnsupportedConfiguration,
} from "./report_selector.js";

const exportUnsupportedMessages = defineMessages({
    not_permissions: { id: "export_unsupported.not.permissions" },
    disabled: { id: "export_unsupported.disabled" },
    raw: { id: "export_unsupported.raw" },
    raw_error: { id: "export_unsupported.raw.error" },
    error: { id: "export_unsupported.error" },
    loading: { id: "export_unsupported.loading" },
});

function getExportUnsupportedTextProvider(messageKey: keyof typeof exportUnsupportedMessages) {
    return function exportUnsupportedTextProvider(intl: IntlShape): string {
        return intl.formatMessage(exportUnsupportedMessages[messageKey]);
    };
}

const hasExportPermissions = createSelector(
    canExecuteRaw,
    canExportTabular,
    (hasExecuteRawPermission, hasExportReportPermission) => {
        return supportsExportToCsv() && hasExportReportPermission && hasExecuteRawPermission;
    },
);

export const getExportBubbleTextProvider = createSelector(
    hasReportError,
    isReportTooLargeSelector,
    hasNegativeValueSelector,
    enableRawExports,
    isExportConfigSupported,
    hasExportPermissions,
    (
        hasError,
        isReportTooLargeSelector,
        hasNegativeValue,
        isSupported,
        enableRawExports,
        hasExportPermissions,
    ) => {
        if (!hasExportPermissions) {
            return getExportUnsupportedTextProvider("not_permissions");
        }

        if (!isSupported) {
            return getExportUnsupportedTextProvider("disabled");
        }

        if (isReportTooLargeSelector) {
            return getExportUnsupportedTextProvider("raw");
        }

        // Donut/Pie/Treemap can't show negative values but exportable
        if (hasError && !hasNegativeValue) {
            if (enableRawExports) {
                return getExportUnsupportedTextProvider("raw_error");
            }
            return getExportUnsupportedTextProvider("error");
        }

        return getExportUnsupportedTextProvider("loading");
    },
);

export const getExportRawBubbleTextProvider = createSelector(
    hasExportErrorExceptTooLarge,
    hasNegativeValueSelector,
    isExportConfigSupported,
    hasExportPermissions,
    (hasError, hasNegativeValue, isSupported, hasExportPermissions) => {
        if (!hasExportPermissions) {
            return getExportUnsupportedTextProvider("not_permissions");
        }

        if (!isSupported) {
            return getExportUnsupportedTextProvider("disabled");
        }
        // Donut/Pie/Treemap can't show negative values but exportable
        if (hasError && !hasNegativeValue) {
            return getExportUnsupportedTextProvider("error");
        }
        return getExportUnsupportedTextProvider("loading");
    },
);

export const getIsExportDisabled = createSelector(
    hasReportError,
    hasNegativeValueSelector,
    isExportConfigSupported,
    getIsReportEmpty,
    isReportOpening,
    isReportSaving,
    isUnsupportedConfiguration,
    (hasError, hasNegativeValue, isSupported, isEmpty, isOpening, isSaving, isUnsupportedConfig) => {
        return !(
            !(isEmpty || isOpening || isSaving || isUnsupportedConfig) &&
            // Donut/Pie/Treemap can't show negative values but exportable
            !(hasError && !hasNegativeValue) &&
            isSupported
        );
    },
);

export const getIsExportCSVDisabled = createSelector(
    canExecuteRaw,
    canExportTabular,
    getIsExportDisabled,
    (hasExecuteRawPermission, hasExportReportPermission, isExportDisabled) => {
        return supportsExportToCsv() && hasExportReportPermission && hasExecuteRawPermission
            ? isExportDisabled
            : true;
    },
);

export const getIsExportRawDisabled = createSelector(
    isExportConfigSupported,
    getIsReportEmpty,
    isReportOpening,
    isReportSaving,
    isUnsupportedConfiguration,
    (isSupported, isEmpty, isOpening, isSaving, isUnsupportedConfig) => {
        const enabled = !(isEmpty || isOpening || isSaving || isUnsupportedConfig) && isSupported;
        return !enabled;
    },
);

export const getIsExportCSVRawDisabled = createSelector(
    canExecuteRaw,
    canExportTabular,
    getIsExportRawDisabled,
    (hasExecuteRawPermission, hasExportReportPermission, getIsExportRawDisabled) => {
        return supportsExportToCsv() && hasExportReportPermission && hasExecuteRawPermission
            ? getIsExportRawDisabled
            : true;
    },
);

export const getIsExportXLSXDisabled = createSelector(
    canExportTabular,
    getIsExportDisabled,
    (hasExportReportPermission, isExportDisabled) => {
        return supportsExportToXlsx() && hasExportReportPermission ? isExportDisabled : true;
    },
);

export const isTableVisualization = createSelector(
    getVisualizationClassTypeFromState,
    (visualizationType) => visualizationType === TABLE,
);

export const getIsExportPDFDisabled = createSelector(
    canExportTabular,
    getIsExportDisabled,
    (hasExportReportPermission, isExportDisabled) => {
        return hasExportReportPermission ? isExportDisabled : true;
    },
);

export const getExportVisible = createSelector(hiddenActions, getIsEmbedded, (hiddenActions, isEmbedded) => {
    return !(hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.EXPORT) && isEmbedded);
});
