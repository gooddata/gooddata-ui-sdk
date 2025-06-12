// (C) 2022-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import {
    insightIsLocked,
    insightTitle,
    insightSummary,
    insightUpdated,
    insightVisualizationType,
    insightCreated,
} from "@gooddata/sdk-model";
import { InsightListItem } from "@gooddata/sdk-ui-kit";
import { VisType } from "@gooddata/sdk-ui";

import { IInsightListProps, InsightList } from "../../../insightList/index.js";
import {
    useDashboardUserInteraction,
    DescriptionTooltipOpenedData,
    useDashboardSelector,
    selectSettings,
    selectEnableRichTextDescriptions,
    selectEnableRichTextDynamicReferences,
} from "../../../../model/index.js";

import { DraggableInsightListItemWrapper } from "./DraggableInsightListItemWrapper.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";

export const DraggableInsightListCore: React.FC<IInsightListProps> = (props) => {
    const { enableDescriptions, WrapInsightListItemWithDragComponent, ...remainingProps } = props;
    const userInteraction = useDashboardUserInteraction();
    const settings = useDashboardSelector(selectSettings);
    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);
    const useReferences = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const { LoadingComponent } = useDashboardComponentsContext();

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
                        updated={insightUpdated(insight) ?? insightCreated(insight)}
                        isLocked={insightIsLocked(insight)}
                        insight={insight}
                        onDescriptionPanelOpen={() => {
                            userInteraction.descriptionTooltipOpened(eventPayload);
                        }}
                        metadataTimeZone={settings?.metadataTimeZone}
                        useRichText={useRichText}
                        useReferences={useReferences}
                        LoadingComponent={LoadingComponent}
                    />
                );
            }}
        />
    );
};
