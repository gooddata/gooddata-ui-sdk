// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";
import { compact, sortBy } from "lodash-es";
import { FormattedMessage } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectSupportsRichTextWidgets } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectIsAiGenerating } from "../../../model/store/config/configSelectors.js";
import { selectIsNewDashboard } from "../../../model/store/meta/metaSelectors.js";
import {
    type AttributeFilterComponentSet,
    type DashboardLayoutWidgetComponentSet,
    type InsightWidgetComponentSet,
    type RichTextWidgetComponentSet,
    type VisualizationSwitcherWidgetComponentSet,
} from "../../componentDefinition/types.js";
import {
    type IWrapCreatePanelItemWithDragComponent,
    type IWrapInsightListItemWithDragComponent,
} from "../../dragAndDrop/types.js";

import { DraggableInsightList } from "./DraggableInsightList/DraggableInsightList.js";

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
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const isAiGenerating = useDashboardSelector(selectIsAiGenerating);
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
            VisualizationSwitcherWidgetComponentSet.creating,
            supportsRichText && RichTextWidgetComponentSet.creating,
        ]);

        return sortBy(items, (item) => item.priority ?? 0).map(({ CreatePanelListItemComponent, type }) => {
            return (
                <CreatePanelListItemComponent
                    key={type}
                    WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
                    disabled={isAiGenerating}
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
        WrapCreatePanelItemWithDragComponent,
        isAiGenerating,
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
                <div className="configuration-category configuration-category-vis drag-to-add flex-panel-item-stretch">
                    <Typography tagName="h3">
                        <FormattedMessage id="visualizationsList.savedVisualizations" />
                    </Typography>
                    <DraggableInsightList
                        WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
                        recalculateSizeReference={className}
                        searchAutofocus={!isNewDashboard}
                        disabled={isAiGenerating}
                    />
                </div>
            </div>
        </div>
    );
}
