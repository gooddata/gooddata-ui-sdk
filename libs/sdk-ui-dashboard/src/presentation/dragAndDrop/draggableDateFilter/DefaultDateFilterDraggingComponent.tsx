// (C) 2007-2022 GoodData Corporation
import React from "react";
import { Icon, ShortenedText } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { selectAllCatalogDateDatasetsMap, useDashboardSelector } from "../../../model/index.js";
import { DateFilterDraggingComponent } from "../../componentDefinition/index.js";

export const DefaultDateFilterDraggingComponent: DateFilterDraggingComponent = ({ item }) => {
    const theme = useTheme();

    const dateDataSetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const dateDataSet = dateDataSetsMap.get(item.filter.dateFilter.dataSet!);
    if (!dateDataSet) {
        return null;
    }
    const { title } = dateDataSet.dataSet;

    // TODO INE: use date specific classes
    return (
        <div className="attribute-filter-button is-dragging">
            <Icon.DragHandle
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
};
