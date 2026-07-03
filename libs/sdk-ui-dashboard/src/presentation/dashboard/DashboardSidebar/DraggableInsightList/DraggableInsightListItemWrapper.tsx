// (C) 2022-2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";
import { type IInsightListItemProps, InsightListItem } from "@gooddata/sdk-ui-kit";

import { DraggableInsightListItem } from "../../../dragAndDrop/draggableWidget/DraggableInsightListItem.js";
import {
    type CustomDashboardInsightListItemComponentProps,
    type IWrapInsightListItemWithDragComponent,
} from "../../../dragAndDrop/types.js";

interface IDraggableInsightListItemWrapperProps extends IInsightListItemProps {
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    className?: string;
    insight: IInsight;
}

export function DraggableInsightListItemBody(props: CustomDashboardInsightListItemComponentProps) {
    const { className } = props;
    return (
        <div className={className}>
            <InsightListItem {...props} />
        </div>
    );
}

export function DraggableInsightListItemWrapper({
    WrapInsightListItemWithDragComponent,
    className,
    isLocked,
    title,
    description,
    showDescriptionPanel,
    type,
    updated,
    insight,
    onDescriptionPanelOpen,
    metadataTimeZone,
    useReferences,
    LoadingComponent,
    filters,
    width,
}: IDraggableInsightListItemWrapperProps) {
    return (
        <DraggableInsightListItem
            WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
            ListItemComponent={DraggableInsightListItemBody}
            listItemComponentProps={{
                className,
                isLocked,
                title,
                description,
                type,
                updated,
                showDescriptionPanel,
                onDescriptionPanelOpen,
                metadataTimeZone,
                useReferences,
                LoadingComponent,
                filters,
                width,
            }}
            insight={insight}
        />
    );
}
