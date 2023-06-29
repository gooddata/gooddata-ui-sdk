// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import {
    insightIsLocked,
    insightTitle,
    insightSummary,
    insightUpdated,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { InsightListItem } from "@gooddata/sdk-ui-kit";
import { IInsightListProps, InsightList } from "../../../insightList/index.js";
import { DraggableInsightListItemWrapper } from "./DraggableInsightListItemWrapper.js";
import { VisType } from "@gooddata/sdk-ui";
import { useDashboardUserInteraction, DescriptionTooltipOpenedData } from "../../../../model/index.js";

export const DraggableInsightListCore: React.FC<IInsightListProps> = (props) => {
    const { enableDescriptions, WrapInsightListItemWithDragComponent, ...remainingProps } = props;
    const userInteraction = useDashboardUserInteraction();

    return (
        <InsightList
            {...remainingProps}
            renderItem={({ item: insight, width, isFirst, isLast }) => {
                if (!insight) {
                    return <InsightListItem isLoading />;
                }

                const visualizationType = insightVisualizationType(insight) as VisType;

                const classNames = cx("gd-visualizations-list-item-wrap", {
                    "is-first": isFirst,
                    "is-last": isLast,
                });

                const description = insightSummary(insight)?.trim();

                const eventPayload: DescriptionTooltipOpenedData = {
                    from: "insight",
                    type: "inherit",
                    description,
                };

                return (
                    <DraggableInsightListItemWrapper
                        WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
                        title={insightTitle(insight)}
                        description={description}
                        showDescriptionPanel={enableDescriptions}
                        type={visualizationType}
                        width={width}
                        className={classNames}
                        updated={insightUpdated(insight)}
                        isLocked={insightIsLocked(insight)}
                        insight={insight}
                        onDescriptionPanelOpen={() => {
                            userInteraction.descriptionTooltipOpened(eventPayload);
                        }}
                    />
                );
            }}
        />
    );
};
