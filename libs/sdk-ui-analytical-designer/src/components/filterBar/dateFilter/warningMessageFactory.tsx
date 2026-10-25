// (C) 2022-2026 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage } from "react-intl";

export const getWarningMessage = (
    isUsedByInsight: boolean,
    migratedAdditionalFilters: string[],
): ReactNode => {
    if (!isUsedByInsight) {
        return <FormattedMessage id="filter.isUnusedWarning" />;
    }
    if (migratedAdditionalFilters.length === 1) {
        return (
            <FormattedMessage
                id="filter.singleAdditionalFilterResetWarning.tooltip"
                values={{ b: (chunks) => <b>{chunks}</b> }}
            />
        );
    }
    if (migratedAdditionalFilters.length > 1) {
        return (
            <FormattedMessage
                id="filter.multipleAdditionalFiltersResetWarning.tooltip"
                values={{ b: (chunks) => <b>{chunks}</b> }}
            />
        );
    }
    return null;
};
