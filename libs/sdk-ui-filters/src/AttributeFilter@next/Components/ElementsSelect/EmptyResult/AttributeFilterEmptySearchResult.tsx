// (C) 2021-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { NoData } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export interface IAttributeFilterEmptySearchResultProps {
    height: number;
}

/**
 * @internal
 */
export const AttributeFilterEmptySearchResult: React.VFC<IAttributeFilterEmptySearchResultProps> = ({
    height,
}) => {
    const intl = useIntl();
    return (
        <div style={{ height, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <NoData noDataLabel={intl.formatMessage({ id: "attributesDropdown.noResultsMatch" })} />
        </div>
    );
};
