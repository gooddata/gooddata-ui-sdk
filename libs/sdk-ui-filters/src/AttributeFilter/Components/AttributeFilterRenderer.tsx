// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AttributeFilterDropdown } from "./Dropdown/AttributeFilterDropdown";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../Context/AttributeFilterContext";

export const AttributeFilterRenderer: React.VFC = () => {
    const { LoadingComponent, ErrorComponent } = useAttributeFilterComponentsContext();
    const { isInitializing, initError } = useAttributeFilterContext();

    if (isInitializing && LoadingComponent) {
        return <LoadingComponent />;
    } else if (initError) {
        return <ErrorComponent message={initError.message} error={initError} />;
    } else {
        return <AttributeFilterDropdown />;
    }
};
