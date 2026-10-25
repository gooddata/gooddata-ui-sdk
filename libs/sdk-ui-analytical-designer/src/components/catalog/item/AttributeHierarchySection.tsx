// (C) 2023-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type ICatalogAttributeHierarchy } from "@gooddata/sdk-model";

import { AttributeHierarchyIconWithTooltip } from "./AttributeHierarchyIconWithTooltip.js";

interface IAttributeHierarchySectionProps {
    attributeHierarchies: ReadonlyArray<ICatalogAttributeHierarchy>;
}

export function AttributeHierarchySection({ attributeHierarchies }: IAttributeHierarchySectionProps) {
    if (!attributeHierarchies?.length) {
        return null;
    }
    return (
        <>
            <h4>
                <FormattedMessage id="dashboard.catalog_item.hierarchy" />
            </h4>
            <div className="s-attribute-hierarchy-wrapper attribute-hierarchy-wrapper">
                {attributeHierarchies.map((item) => {
                    const key = item.attributeHierarchy.id;
                    const title = item.attributeHierarchy.title;
                    return (
                        <div key={key} className="attribute-hierarchy-name s-attribute-hierarchy-name">
                            <div className="attribute-hierarchy-name-value">{title}</div>
                            <AttributeHierarchyIconWithTooltip attributeHierarchy={item} />
                        </div>
                    );
                })}
            </div>
        </>
    );
}
