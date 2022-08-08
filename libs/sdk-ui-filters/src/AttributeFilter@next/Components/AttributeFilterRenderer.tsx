// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AttributeFilterDropdown } from "./Dropdown/AttributeFilterDropdown";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../Context/AttributeFilterContext";

export const AttributeFilterRenderer: React.VFC = () => {
    const { AttributeFilterLoading, AttributeFilterError } = useAttributeFilterComponentsContext();
    const { isInitializing, initError } = useAttributeFilterContext();

    if (isInitializing) {
        return <AttributeFilterLoading />;
    } else if (initError) {
        return <AttributeFilterError message={initError.message} />;
    } else {
        return <AttributeFilterDropdown />;
    }
};
