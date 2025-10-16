// (C) 2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { ISemanticQualityIssue } from "@gooddata/sdk-model";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import { ICatalogItem } from "../catalogItem/index.js";
import { QualityIssue } from "../quality/index.js";

type Props = {
    item: ICatalogItem;
    issues: ISemanticQualityIssue[];
};

export function CatalogDetailTabQuality({ item, issues }: Props) {
    return (
        <div className="gd-analytics-catalog-detail__tab-quality">
            {issues.length > 0 ? (
                issues.map((issue, idx) => (
                    <QualityIssue
                        key={idx}
                        objectId={item.identifier}
                        objectTitle={item.title}
                        issue={issue}
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
