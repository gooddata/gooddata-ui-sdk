// (C) 2020-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { areObjRefsEqual, bucketsAttributes, insightBuckets } from "@gooddata/sdk-model";

import {
    DrillIntersectionIgnoredAttributesSelect,
    type IDrillIntersectionIgnoredAttributesSelectOption,
} from "./DrillIntersectionIgnoredAttributesSelect.js";
import {
    selectCatalogAttributeDisplayForms,
    selectCatalogDateDatasets,
    selectInsightByWidgetRef,
    useDashboardSelector,
} from "../../../../model/index.js";
import { type DRILL_TARGET_TYPE, type IDrillConfigItem } from "../../../drill/types.js";

export interface IDrillIntersectionIgnoredAttributesProps {
    item: IDrillConfigItem;
    onChange: (ignoredAttributes: string[]) => void;
    drillTargetType?: DRILL_TARGET_TYPE;
}

export function DrillIntersectionIgnoredAttributes({
    item,
    onChange,
    drillTargetType,
}: IDrillIntersectionIgnoredAttributesProps) {
    const insight = useDashboardSelector(selectInsightByWidgetRef(item.widgetRef));
    const insightAttributes = bucketsAttributes(insight ? insightBuckets(insight) : []);
    const allCatalogDisplayForms = useDashboardSelector(selectCatalogAttributeDisplayForms);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const allCatalogDateAttributeDisplayForms = allDateDatasets
        .flatMap((ds) => ds.dateAttributes)
        .flatMap((da) => da.defaultDisplayForm);

    const displayForms = insightAttributes.map((idf) => {
        const catalogAttr = allCatalogDisplayForms.find((df) =>
            areObjRefsEqual(df.ref, idf.attribute.displayForm),
        );
        const catalogDateAttribute = allCatalogDateAttributeDisplayForms.find((df) =>
            areObjRefsEqual(df.ref, idf.attribute.displayForm),
        );
        const type = catalogDateAttribute ? "date" : "attribute";

        return {
            insightAttr: idf,
            catalogAttr: catalogAttr ?? catalogDateAttribute,
            type,
        };
    });

    const options = displayForms.map(
        (df): IDrillIntersectionIgnoredAttributesSelectOption => ({
            id: df.insightAttr.attribute.localIdentifier,
            title: df.catalogAttr?.title ?? "",
            type: df.type as "attribute" | "date",
        }),
    );

    const selection =
        item.drillIntersectionIgnoredAttributes?.map(
            (id): IDrillIntersectionIgnoredAttributesSelectOption => {
                const option = options.find((o) => o.id === id);
                return {
                    id,
                    title: option?.title ?? "",
                    type: option?.type ?? "attribute",
                };
            },
        ) ?? [];

    if (insightAttributes.length === 0) {
        return null;
    }

    return (
        <div className="gd-drill-intersection-ignored-attributes-select-section">
            <div className="gd-drill-intersection-ignored-attributes-select-label">
                <FormattedMessage id="configurationPanel.drillConfig.drillIntersectionIgnoredAttributes.label" />
            </div>
            <DrillIntersectionIgnoredAttributesSelect
                drillTargetType={drillTargetType}
                initialSelection={selection}
                options={options}
                onApply={(selection) => {
                    onChange(selection.map((s) => s.id));
                }}
            />
        </div>
    );
}
