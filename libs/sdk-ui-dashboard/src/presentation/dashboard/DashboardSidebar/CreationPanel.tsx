// (C) 2007-2025 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";
import { compact, sortBy } from "lodash-es";
import { FormattedMessage } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

import { DraggableInsightList } from "./DraggableInsightList/index.js";
import {
    selectEnableKDRichText,
    selectEnableVisualizationSwitcher,
    selectIsAnalyticalDesignerEnabled,
    selectIsNewDashboard,
    selectSettings,
    selectSupportsRichTextWidgets,
    useDashboardSelector,
} from "../../../model/index.js";
import {
    AttributeFilterComponentSet,
    DashboardLayoutWidgetComponentSet,
    InsightWidgetComponentSet,
    RichTextWidgetComponentSet,
    VisualizationSwitcherWidgetComponentSet,
} from "../../componentDefinition/index.js";
import {
    IWrapCreatePanelItemWithDragComponent,
    IWrapInsightListItemWithDragComponent,
} from "../../dragAndDrop/types.js";

interface ICreationPanelProps {
    className?: string;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    AttributeFilterComponentSet?: AttributeFilterComponentSet;
    InsightWidgetComponentSet?: InsightWidgetComponentSet;
    RichTextWidgetComponentSet?: RichTextWidgetComponentSet;
    VisualizationSwitcherWidgetComponentSet?: VisualizationSwitcherWidgetComponentSet;
    DashboardLayoutWidgetComponentSet?: DashboardLayoutWidgetComponentSet;
}

export function CreationPanel(props: ICreationPanelProps) {
    const { className, WrapCreatePanelItemWithDragComponent, WrapInsightListItemWithDragComponent } = props;
    const supportsRichText = useDashboardSelector(selectSupportsRichTextWidgets);
    const enableRichText = useDashboardSelector(selectEnableKDRichText);
    const enableVisualizationSwitcher = useDashboardSelector(selectEnableVisualizationSwitcher);
    const isAnalyticalDesignerEnabled = useDashboardSelector(selectIsAnalyticalDesignerEnabled);
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const settings = useDashboardSelector(selectSettings);
    const AttributeFilterComponentSet = props.AttributeFilterComponentSet!;
    const InsightWidgetComponentSet = props.InsightWidgetComponentSet!;
    const RichTextWidgetComponentSet = props.RichTextWidgetComponentSet!;
    const VisualizationSwitcherWidgetComponentSet = props.VisualizationSwitcherWidgetComponentSet!;
    const DashboardLayoutWidgetComponentSet = props.DashboardLayoutWidgetComponentSet!;

    const addItemPanelItems = useMemo(() => {
        const items = compact([
            InsightWidgetComponentSet.creating,
            AttributeFilterComponentSet.creating,
            DashboardLayoutWidgetComponentSet.creating,
            enableVisualizationSwitcher && VisualizationSwitcherWidgetComponentSet.creating,
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
        InsightWidgetComponentSet,
        RichTextWidgetComponentSet,
        VisualizationSwitcherWidgetComponentSet,
        DashboardLayoutWidgetComponentSet,
        supportsRichText,
        enableRichText,
        enableVisualizationSwitcher,
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
}
