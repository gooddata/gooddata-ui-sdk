// (C) 2021-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { NoData } from "@gooddata/sdk-ui-kit";

/**
 * Component that displays empty result message
 * @beta
 */
export const AttributeFilterEmptySearchResult: React.VFC = () => {
    const intl = useIntl();

    return <NoData noDataLabel={intl.formatMessage({ id: "attributesDropdown.noResultsMatch" })} />;
};
