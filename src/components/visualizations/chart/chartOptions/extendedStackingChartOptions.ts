// (C) 2007-2018 GoodData Corporation
import { IPointData, IUnwrappedAttributeHeadersWithItems } from "../chartOptionsBuilder";
import { createDrillIntersectionElement } from "../../utils/drilldownEventing";
import { getAttributeElementIdFromAttributeElementUri } from "../../utils/common";

export function getDrillableSeriesWithParentAttribute(
    series: any,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems,
) {
    return series.map((seriesItem: any) => {
        const { isDrillable, data } = seriesItem;
        if (!isDrillable || !data) {
            return seriesItem;
        }
        const newData = data.map((pointData: IPointData, pointIndex: number) => {
            if (!pointData.drilldown || !pointData.drillIntersection) {
                return pointData;
            }
            const { identifier, uri, items } = viewByParentAttribute;
            const { name, uri: attributeElementUri } = items[pointIndex].attributeHeaderItem;
            const parentElement = createDrillIntersectionElement(
                getAttributeElementIdFromAttributeElementUri(attributeElementUri),
                name,
                uri,
                identifier,
            );
            return {
                ...pointData,
                drillIntersection: [...pointData.drillIntersection, parentElement],
            };
        });
        return {
            ...seriesItem,
            data: newData,
        };
    });
}
