// (C) 2022-2025 GoodData Corporation

import cx from "classnames";

import {
    insightCreated,
    insightIsLocked,
    insightSummary,
    insightTitle,
    insightUpdated,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";
import { InsightListItem } from "@gooddata/sdk-ui-kit";

import { DraggableInsightListItemWrapper } from "./DraggableInsightListItemWrapper.js";
import {
    DescriptionTooltipOpenedData,
    selectEnableRichTextDescriptions,
    selectEnableRichTextDynamicReferences,
    selectSettings,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../model/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import { IInsightListProps, InsightList } from "../../../insightList/index.js";

export function DraggableInsightListCore({
    enableDescriptions,
    WrapInsightListItemWithDragComponent,
    ...remainingProps
}: IInsightListProps) {
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
}
