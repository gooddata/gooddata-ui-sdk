// (C) 2007-2025 GoodData Corporation

import { IconDragHandle, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { selectAllCatalogDateDatasetsMap, useDashboardSelector } from "../../../model/index.js";
import { IDateFilterDraggingComponentProps } from "../../componentDefinition/index.js";
import { useCurrentDateFilterConfig } from "../useCurrentDateFilterConfig.js";

export function DefaultDateFilterDraggingComponent({ item }: IDateFilterDraggingComponentProps) {
    const theme = useTheme();

    const dateDataSetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const dateDataSet = dateDataSetsMap.get(item.filter.dateFilter.dataSet!);
    const dataSetTitle = dateDataSet ? dateDataSet.dataSet.title : "";
    const { title } = useCurrentDateFilterConfig(item.filter.dateFilter.dataSet, dataSetTitle);

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
