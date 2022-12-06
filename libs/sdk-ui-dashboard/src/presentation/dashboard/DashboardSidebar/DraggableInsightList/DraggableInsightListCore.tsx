// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import {
    insightIsLocked,
    insightTitle,
    insightSummary,
    insightUpdated,
    insightVisualizationUrl,
} from "@gooddata/sdk-model";
import { InsightListItem } from "@gooddata/sdk-ui-kit";
import { IInsightListProps, InsightList } from "../../../insightList";
import { DraggableInsightListItemWrapper } from "./DraggableInsightListItemWrapper";
import { VisType } from "@gooddata/sdk-ui";

export const DraggableInsightListCore: React.FC<IInsightListProps> = (props) => {
    const { enableDescriptions, ...remainingProps } = props;
    return (
        <InsightList
            {...remainingProps}
            renderItem={({ item: insight, width, isFirst, isLast }) => {
                if (!insight) {
                    return <InsightListItem isLoading />;
                }

                const visualizationUrl = insightVisualizationUrl(insight);
                const visualizationType = visualizationUrl?.split(":")[1] as VisType;

                const classNames = cx("gd-visualizations-list-item-wrap", {
                    "is-first": isFirst,
                    "is-last": isLast,
                });

                return (
                    <DraggableInsightListItemWrapper
                        title={insightTitle(insight)}
                        description={insightSummary(insight)?.trim()}
                        showDescriptionPanel={enableDescriptions}
                        type={visualizationType}
                        width={width}
                        className={classNames}
                        updated={insightUpdated(insight)}
                        isLocked={insightIsLocked(insight)}
                        insight={insight}
                    />
                );
            }}
        />
    );
};
