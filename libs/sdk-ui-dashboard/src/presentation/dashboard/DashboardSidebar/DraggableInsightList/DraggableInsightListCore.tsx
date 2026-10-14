// (C) 2022-2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";

import {
    type IInsight,
    type ObjRef,
    insightCreated,
    insightIsLocked,
    insightSummary,
    insightTitle,
    insightUpdated,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { type VisType } from "@gooddata/sdk-ui";
import { InsightListItem } from "@gooddata/sdk-ui-kit";

import { type DescriptionTooltipOpenedData } from "../../../../model/events/userInteraction.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../../../../model/react/useDashboardUserInteraction.js";
import { selectSettings } from "../../../../model/store/config/configSelectors.js";
import { selectPermissions } from "../../../../model/store/permissions/permissionsSelectors.js";
import { selectRestrictedRichTextReferences } from "../../../../model/store/unavailableObjects/unavailableObjectsSelectors.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/DashboardComponentsContext.js";
import { InsightList } from "../../../insightList/InsightList.js";
import { InsightListDivider } from "../../../insightList/InsightListDivider.js";
import { type IInsightListProps } from "../../../insightList/types.js";

import { DeleteInsightDialog } from "./DeleteInsightDialog.js";
import { DraggableInsightListItemWrapper } from "./DraggableInsightListItemWrapper.js";
import { canDeleteInsight, shouldLoadInsightPermissionsForDelete } from "./insightDeleteGate.js";

export function DraggableInsightListCore({
    WrapInsightListItemWithDragComponent,
    disabled,
    ...remainingProps
}: IInsightListProps) {
    const userInteraction = useDashboardUserInteraction();
    const settings = useDashboardSelector(selectSettings);
    const permissions = useDashboardSelector(selectPermissions);
    const restrictedReferences = useDashboardSelector(selectRestrictedRichTextReferences);
    const { LoadingComponent } = useDashboardComponentsContext();
    const [insightToDelete, setInsightToDelete] = useState<IInsight | undefined>(undefined);
    const [deletedRefs, setDeletedRefs] = useState<ObjRef[]>([]);

    return (
        <>
            {insightToDelete ? (
                <DeleteInsightDialog
                    insight={insightToDelete}
                    onClose={() => setInsightToDelete(undefined)}
                    onDeleted={(ref) => setDeletedRefs((refs) => [...refs, ref])}
                />
            ) : null}
            <InsightList
                {...remainingProps}
                disabled={disabled}
                includePermissions={shouldLoadInsightPermissionsForDelete(settings, permissions)}
                excludeRefs={deletedRefs}
                renderItem={({ item: insight, width, isFirst, isLast }) => {
                    if (!insight) {
                        return <InsightListItem isLoading />;
                    }
                    if ("divider" in insight) {
                        return <InsightListDivider />;
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
                            showDescriptionPanel
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
                            useReferences
                            restrictedReferences={restrictedReferences}
                            LoadingComponent={LoadingComponent}
                            disabled={disabled}
                            onDelete={
                                !disabled &&
                                !insight.isRelated &&
                                canDeleteInsight(insight, settings, permissions)
                                    ? () => setInsightToDelete(insight)
                                    : undefined
                            }
                        />
                    );
                }}
            />
        </>
    );
}
