// (C) 2022 GoodData Corporation
import React from "react";
import { IInsightListItemProps, InsightListItem } from "@gooddata/sdk-ui-kit";
import { IInsight } from "@gooddata/sdk-model";
import { DraggableInsightListItem } from "../../../dragAndDrop/draggableWidget/DraggableInsightListItem.js";
import {
    CustomDashboardInsightListItemComponent,
    IWrapInsightListItemWithDragComponent,
} from "../../../dragAndDrop/types.js";

interface IDraggableInsightListItemWrapperProps extends IInsightListItemProps {
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    className?: string;
    insight: IInsight;
}

export const DraggableInsightListItemBody: CustomDashboardInsightListItemComponent = (props) => {
    const { className } = props;
    return (
        <div className={className}>
            <InsightListItem {...props} />
        </div>
    );
};

export const DraggableInsightListItemWrapper: React.FC<IDraggableInsightListItemWrapperProps> = (props) => {
    const {
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
    } = props;
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
            }}
            insight={insight}
        />
    );
};
