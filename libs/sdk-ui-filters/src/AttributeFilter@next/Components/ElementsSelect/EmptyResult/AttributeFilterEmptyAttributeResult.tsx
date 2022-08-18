// (C) 2021-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { NoData } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export const AttributeFilterEmptyAttributeResult: React.VFC = () => {
    const intl = useIntl();

    return <NoData noDataLabel={intl.formatMessage({ id: "attributesDropdown.noData" })} />;
};
