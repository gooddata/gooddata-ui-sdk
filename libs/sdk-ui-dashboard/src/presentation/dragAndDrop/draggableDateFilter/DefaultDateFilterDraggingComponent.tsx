// (C) 2007-2026 GoodData Corporation

import { dashboardFilterObjRef } from "@gooddata/sdk-model";
import { IconDragHandle, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectAllCatalogDateDatasetsMap } from "../../../model/store/catalog/catalogSelectors.js";
import { type IDateFilterDraggingComponentProps } from "../../componentDefinition/types.js";
import { useCurrentDateFilterConfig } from "../useCurrentDateFilterConfig.js";

export function DefaultDateFilterDraggingComponent({ item }: IDateFilterDraggingComponentProps) {
    const theme = useTheme();

    const dateDataSetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const dateDataSet = dateDataSetsMap.get(dashboardFilterObjRef(item.filter)!);
    const dataSetTitle = dateDataSet ? dateDataSet.dataSet.title : "";
    const { title } = useCurrentDateFilterConfig(dashboardFilterObjRef(item.filter), dataSetTitle);

    if (!dateDataSet) {
        return null;
    }

    return (
        <div className="s-date-filter-drag attribute-filter-button is-dragging">
            <IconDragHandle
                width={7}
                height={26}
                className="drag-handle-icon"
                color={theme?.palette?.complementary?.c5}
            />
            <div className="button-content">
                <div className="button-title">
                    <ShortenedText>{title}</ShortenedText>
                </div>
            </div>
        </div>
    );
}
