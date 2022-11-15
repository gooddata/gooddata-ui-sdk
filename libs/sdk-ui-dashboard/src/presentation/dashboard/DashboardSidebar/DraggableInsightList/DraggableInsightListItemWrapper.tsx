// (C) 2022 GoodData Corporation
import React from "react";
import { IInsightListItemProps, InsightListItem } from "@gooddata/sdk-ui-kit";
import { IInsight } from "@gooddata/sdk-model";
import { DraggableInsightListItem } from "../../../dragAndDrop/draggableWidget/DraggableInsightListItem";
import { CustomDashboardInsightListItemComponent } from "../../../dragAndDrop/types";

interface IDraggableInsightListItemWrapperProps extends IInsightListItemProps {
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
    const { className, isLocked, title, type, updated, insight } = props;
    return (
        <DraggableInsightListItem
            ListItemComponent={DraggableInsightListItemBody}
            listItemComponentProps={{ className, isLocked, title, type, updated }}
            insight={insight}
        />
    );
};
