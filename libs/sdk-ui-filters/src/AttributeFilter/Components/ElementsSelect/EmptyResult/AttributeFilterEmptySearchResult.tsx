// (C) 2021-2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { NoData } from "@gooddata/sdk-ui-kit";

/**
 * Component that displays empty result message
 * @beta
 */
export function AttributeFilterEmptySearchResult() {
    const intl = useIntl();

    return <NoData noDataLabel={intl.formatMessage({ id: "attributesDropdown.noResultsMatch" })} />;
}
