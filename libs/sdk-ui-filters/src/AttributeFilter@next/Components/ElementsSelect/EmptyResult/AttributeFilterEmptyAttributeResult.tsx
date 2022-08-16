// (C) 2021-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { NoData } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export interface IAttributeFilterEmptyAttributeResultProps {
    height: number;
}

/**
 * @internal
 */
export const AttributeFilterEmptyAttributeResult: React.VFC<IAttributeFilterEmptyAttributeResultProps> = ({
    height,
}) => {
    const intl = useIntl();
    return (
        <div style={{ height, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <NoData noDataLabel={intl.formatMessage({ id: "attributesDropdown.noData" })} />
        </div>
    );
};
