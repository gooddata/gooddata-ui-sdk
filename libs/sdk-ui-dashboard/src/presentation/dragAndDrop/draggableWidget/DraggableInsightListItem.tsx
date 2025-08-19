// (C) 2022-2025 GoodData Corporation
import React from "react";

import { IInsight } from "@gooddata/sdk-model";

import { useWidgetSelection } from "../../../model/index.js";
import {
    CustomDashboardInsightListItemComponent,
    CustomDashboardInsightListItemComponentProps,
    IWrapInsightListItemWithDragComponent,
} from "../types.js";

/**
 * @internal
 */
export interface IDraggableInsightListItemProps {
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    ListItemComponent: CustomDashboardInsightListItemComponent;
    listItemComponentProps: CustomDashboardInsightListItemComponentProps;
    insight: IInsight;
}

/**
 * @internal
 */
export function DraggableInsightListItem(props: IDraggableInsightListItemProps) {
    const { ListItemComponent, listItemComponentProps, insight } = props;
    const WrapInsightListItemWithDragComponent = props.WrapInsightListItemWithDragComponent!;

    const { deselectWidgets } = useWidgetSelection();

    return (
        <WrapInsightListItemWithDragComponent insight={insight} onDragStart={() => deselectWidgets()}>
            <ListItemComponent {...listItemComponentProps} />
        </WrapInsightListItemWithDragComponent>
    );
}
