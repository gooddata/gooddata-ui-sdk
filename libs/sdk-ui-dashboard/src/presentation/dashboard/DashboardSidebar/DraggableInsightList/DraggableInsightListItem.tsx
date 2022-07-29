// (C) 2022 GoodData Corporation
import React from "react";
import { IInsightListItemProps, InsightListItem } from "@gooddata/sdk-ui-kit";
import {
    DraggableInsightPlaceholder,
    CustomDashboardInsightPlaceholderComponent,
} from "../../../dragAndDrop";

interface IDraggableInsightListItemProps extends IInsightListItemProps {
    className?: string;
}

const DraggableInsightListItemBody: CustomDashboardInsightPlaceholderComponent = (props) => {
    const { className } = props;
    return (
        <div className={className}>
            <InsightListItem {...props} />
        </div>
    );
};

export const DraggableInsightListItem: React.FC<IDraggableInsightListItemProps> = (props) => {
    const { className, isLocked, title, type, updated } = props;
    return (
        <DraggableInsightPlaceholder
            PlaceholderComponent={DraggableInsightListItemBody}
            placeholderComponentProps={{ className, isLocked, title, type, updated }}
        />
    );
};
