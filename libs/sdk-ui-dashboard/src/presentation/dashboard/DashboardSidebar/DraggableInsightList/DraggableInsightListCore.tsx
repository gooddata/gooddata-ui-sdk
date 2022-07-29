// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { insightIsLocked, insightTitle, insightUpdated, insightVisualizationUrl } from "@gooddata/sdk-model";
import { InsightListItem } from "@gooddata/sdk-ui-kit";
import { IInsightListProps, InsightList } from "../../../insightList";
import { DraggableInsightListItem } from "./DraggableInsightListItem";

export const DraggableInsightListCore: React.FC<IInsightListProps> = (props) => {
    return (
        <InsightList
            {...props}
            renderItem={({ item: insight, width, isFirst, isLast }) => {
                if (!insight) {
                    return <InsightListItem isLoading />;
                }

                const visualizationUrl = insightVisualizationUrl(insight);
                const visualizationType = visualizationUrl?.split(":")[1];

                const classNames = cx("gd-visualizations-list-item-wrap", {
                    "is-first": isFirst,
                    "is-last": isLast,
                });

                return (
                    <DraggableInsightListItem
                        title={insightTitle(insight)}
                        type={visualizationType}
                        width={width}
                        className={classNames}
                        updated={insightUpdated(insight)}
                        isLocked={insightIsLocked(insight)}
                    />
                );
            }}
        />
    );
};
