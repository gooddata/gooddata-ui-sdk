// (C) 2025 GoodData Corporation

import { type MouseEvent } from "react";

import { FormattedMessage } from "react-intl";

import { type ISemanticQualityIssue, type SemanticQualityIssueAttributeName } from "@gooddata/sdk-model";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import { ICatalogItem, type ICatalogItemRef } from "../catalogItem/index.js";
import { QualityIssue } from "../quality/index.js";

type Props = {
    item: ICatalogItem;
    issues: ISemanticQualityIssue[];
    canEdit: boolean;
    onEditClick?: (attributeName: SemanticQualityIssueAttributeName) => void;
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void;
};

export function CatalogDetailTabQuality({
    item,
    issues,
    canEdit,
    onEditClick,
    onCatalogItemNavigation,
}: Props) {
    return (
        <div className="gd-analytics-catalog-detail__tab-quality">
            {issues.length > 0 ? (
                issues.map((issue, idx) => (
                    <QualityIssue
                        key={idx}
                        objectId={item.identifier}
                        issue={issue}
                        canEdit={canEdit}
                        onEditClick={onEditClick}
                        onObjectClick={onCatalogItemNavigation}
                    />
                ))
            ) : (
                <div className="gd-analytics-catalog-detail__tab-quality__empty">
                    <UiIcon type="checkCircle" size={26} ariaHidden color="currentColor" />
                    <FormattedMessage id="analyticsCatalog.catalogItem.tab.quality.empty" />
                </div>
            )}
        </div>
    );
}
