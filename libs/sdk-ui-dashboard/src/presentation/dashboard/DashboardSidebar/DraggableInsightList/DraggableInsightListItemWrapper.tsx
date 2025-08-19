// (C) 2022-2025 GoodData Corporation
import React from "react";

import { IInsight } from "@gooddata/sdk-model";
import { IInsightListItemProps, InsightListItem } from "@gooddata/sdk-ui-kit";

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
        metadataTimeZone,
        useRichText,
        useReferences,
        LoadingComponent,
        filters,
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
                metadataTimeZone,
                useRichText,
                useReferences,
                LoadingComponent,
                filters,
            }}
            insight={insight}
        />
    );
};
