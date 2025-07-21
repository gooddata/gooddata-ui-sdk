// (C) 2022-2025 GoodData Corporation
import { IInsight } from "@gooddata/sdk-model";

import {
    CustomDashboardInsightListItemComponent,
    CustomDashboardInsightListItemComponentProps,
    IWrapInsightListItemWithDragComponent,
} from "../types.js";
import { useWidgetSelection } from "../../../model/index.js";

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
