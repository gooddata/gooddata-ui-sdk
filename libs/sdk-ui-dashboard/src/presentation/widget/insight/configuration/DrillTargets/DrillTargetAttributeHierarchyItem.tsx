// (C) 2023 GoodData Corporation
import React from "react";
import { objRefToString } from "@gooddata/sdk-model";
import { DropdownButton } from "@gooddata/sdk-ui-kit";

import { IDrillDownAttributeHierarchyConfig } from "../../../../drill/types.js";
import { selectCatalogAttributeHierarchies, useDashboardSelector } from "../../../../../model/index.js";

interface IDrillTargetDashboardItemProps {
    config: IDrillDownAttributeHierarchyConfig;
}

const DrillTargetAttributeHierarchyItem: React.FC<IDrillTargetDashboardItemProps> = ({ config }) => {
    const catalogAttributeHierarchies = useDashboardSelector(selectCatalogAttributeHierarchies);
    const selectedCatalogAttributeHierarchy = catalogAttributeHierarchies.find(
        (it) => objRefToString(it.attributeHierarchy.ref) === objRefToString(config.attributeHierarchyRef),
    );

    return (
        <DropdownButton
            className="gd-button-small s-visualization-button-target-insight"
            value={selectedCatalogAttributeHierarchy?.attributeHierarchy.title}
            disabled={true}
            isSmall={false}
            iconLeft="gd-icon-attribute-hierarchy"
        />
    );
};

export default DrillTargetAttributeHierarchyItem;
