// (C) 2007-2024 GoodData Corporation
import React, { useMemo } from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import compact from "lodash/compact.js";
import sortBy from "lodash/sortBy.js";
import { FormattedMessage } from "react-intl";

import { DraggableInsightList } from "./DraggableInsightList/index.js";
import {
    selectSupportsKpiWidgetCapability,
    selectIsAnalyticalDesignerEnabled,
    useDashboardSelector,
    selectIsNewDashboard,
    selectSettings,
    selectEnableKDRichText,
    selectSupportsRichTextWidgets,
} from "../../../model/index.js";
import cx from "classnames";
import {
    IWrapCreatePanelItemWithDragComponent,
    IWrapInsightListItemWithDragComponent,
} from "../../dragAndDrop/types.js";
import {
    AttributeFilterComponentSet,
    InsightWidgetComponentSet,
    KpiWidgetComponentSet,
    RichTextWidgetComponentSet,
} from "../../componentDefinition/index.js";

interface ICreationPanelProps {
    className?: string;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    KpiWidgetComponentSet?: KpiWidgetComponentSet;
    AttributeFilterComponentSet?: AttributeFilterComponentSet;
    InsightWidgetComponentSet?: InsightWidgetComponentSet;
    RichTextWidgetComponentSet?: RichTextWidgetComponentSet;
}

export const CreationPanel: React.FC<ICreationPanelProps> = (props) => {
    const { className, WrapCreatePanelItemWithDragComponent, WrapInsightListItemWithDragComponent } = props;
    const supportsKpis = useDashboardSelector(selectSupportsKpiWidgetCapability);
    const supportsRichText = useDashboardSelector(selectSupportsRichTextWidgets);
    const enableRichText = useDashboardSelector(selectEnableKDRichText);
    const isAnalyticalDesignerEnabled = useDashboardSelector(selectIsAnalyticalDesignerEnabled);
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const settings = useDashboardSelector(selectSettings);
    const KpiWidgetComponentSet = props.KpiWidgetComponentSet!;
    const AttributeFilterComponentSet = props.AttributeFilterComponentSet!;
    const InsightWidgetComponentSet = props.InsightWidgetComponentSet!;
    const RichTextWidgetComponentSet = props.RichTextWidgetComponentSet!;

    const addItemPanelItems = useMemo(() => {
        const items = compact([
            supportsKpis && KpiWidgetComponentSet.creating,
            AttributeFilterComponentSet.creating,
            InsightWidgetComponentSet.creating,
            supportsRichText && enableRichText && RichTextWidgetComponentSet.creating,
        ]);

        return sortBy(items, (item) => item.priority ?? 0).map(({ CreatePanelListItemComponent, type }) => {
            return (
                <CreatePanelListItemComponent
                    key={type}
                    WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
                />
            );
        });
    }, [
        AttributeFilterComponentSet,
        KpiWidgetComponentSet,
        InsightWidgetComponentSet,
        RichTextWidgetComponentSet,
        supportsKpis,
        supportsRichText,
        enableRichText,
        WrapCreatePanelItemWithDragComponent,
    ]);

    return (
        <div className={cx("configuration-panel creation-panel", className)}>
            <div className="configuration-panel-content">
                <Typography tagName="h2" className="flex-panel-item-nostretch">
                    <FormattedMessage id="visualizationsList.dragToAdd" />
                </Typography>
                <div className="configuration-category drag-to-add">
                    <Typography tagName="h3">
                        <FormattedMessage id="addPanel.newItem" />
                    </Typography>
                    <div className="add-item-panel">{addItemPanelItems}</div>
                </div>
                {isAnalyticalDesignerEnabled ? (
                    <div className="configuration-category configuration-category-vis drag-to-add flex-panel-item-stretch">
                        <Typography tagName="h3">
                            <FormattedMessage id="visualizationsList.savedVisualizations" />
                        </Typography>
                        <DraggableInsightList
                            WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
                            recalculateSizeReference={className}
                            searchAutofocus={!isNewDashboard}
                            enableDescriptions={settings?.enableDescriptions}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
};
