// (C) 2022 GoodData Corporation
import React from "react";
import { IInsight } from "@gooddata/sdk-model";

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

    return (
        <WrapInsightListItemWithDragComponent insight={insight}>
            <ListItemComponent {...listItemComponentProps} />
        </WrapInsightListItemWithDragComponent>
    );
}
