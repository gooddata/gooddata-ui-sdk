// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";
import { IconDragHandle, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectCatalogMeasures } from "../../../model/store/catalog/catalogSelectors.js";
import { type MeasureValueFilterDraggableItem } from "../types.js";

export function DefaultMeasureValueFilterDraggingComponent({
    item,
}: {
    item: MeasureValueFilterDraggableItem;
}) {
    const theme = useTheme();
    const measures = useDashboardSelector(selectCatalogMeasures);
    const { measure, title } = item.filter.dashboardMeasureValueFilter;

    const catalogMeasure = useMemo(
        () => measures.find((m) => areObjRefsEqual(m.measure.ref, measure)),
        [measure, measures],
    );
    const measureTitle = title ?? catalogMeasure?.measure.title ?? objRefToString(measure);

    return (
        <div className="measure-value-filter-button attribute-filter-button is-dragging">
            <IconDragHandle
                width={7}
                height={26}
                className="drag-handle-icon"
                color={theme?.palette?.complementary?.c5}
            />
            <div className="button-content">
                <div className="button-title">
                    <ShortenedText>{measureTitle}</ShortenedText>
                </div>
            </div>
        </div>
    );
}
