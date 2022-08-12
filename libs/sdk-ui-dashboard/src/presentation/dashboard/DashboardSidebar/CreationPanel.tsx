// (C) 2007-2022 GoodData Corporation
import React, { useMemo } from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import compact from "lodash/compact";
import sortBy from "lodash/sortBy";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

import { DraggableInsightList } from "./DraggableInsightList";
import { selectSupportsKpiWidgetCapability, useDashboardSelector } from "../../../model";
import { useDashboardComponentsContext } from "../../dashboardContexts";

interface ICreationPanelProps {
    isSticky: boolean;
}

export const CreationPanel: React.FC<ICreationPanelProps> = ({ isSticky = false }) => {
    const supportsKpis = useDashboardSelector(selectSupportsKpiWidgetCapability);

    const { KpiWidgetComponentSet, AttributeFilterComponentSet, InsightWidgetComponentSet } =
        useDashboardComponentsContext();

    const addItemPanelItems = useMemo(() => {
        const items = compact([
            supportsKpis && KpiWidgetComponentSet.creating,
            AttributeFilterComponentSet.creating,
            InsightWidgetComponentSet.creating,
        ]);

        return sortBy(items, (item) => item.priority ?? 0).map(({ CreatePanelListItemComponent, type }) => (
            <CreatePanelListItemComponent key={type} />
        ));
    }, [AttributeFilterComponentSet, KpiWidgetComponentSet, InsightWidgetComponentSet, supportsKpis]);

    return (
        <div className="configuration-panel creation-panel">
            <div
                className={cx("flex-panel-full-vh-height", {
                    "sticky-panel": isSticky,
                })}
            >
                <Typography tagName="h2" className="flex-panel-item-nostretch">
                    <FormattedMessage id="visualizationsList.dragToAdd" />
                </Typography>
                <div className="configuration-category drag-to-add">
                    <Typography tagName="h3">
                        <FormattedMessage id="addPanel.newItem" />
                    </Typography>
                    <div className="add-item-panel">{addItemPanelItems}</div>
                </div>
                <div className="configuration-category configuration-category-vis drag-to-add flex-panel-item-stretch">
                    <Typography tagName="h3">
                        <FormattedMessage id="visualizationsList.savedVisualizations" />
                    </Typography>
                    <DraggableInsightList />
                </div>
            </div>
        </div>
    );
};
