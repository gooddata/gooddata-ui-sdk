// (C) 2024 GoodData Corporation

import { Button, Icon, Typography } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import React, { useCallback, useState } from "react";
import cx from "classnames";
import { v4 as uuid } from "uuid";

import {
    IInsight,
    IInsightWidget,
    IVisualizationSwitcherWidget,
    idRef,
    insightRef,
    insightTitle,
} from "@gooddata/sdk-model";
import { gdColorStateBlank } from "../../../constants/colors.js";
import noop from "lodash/noop.js";

import { DashboardInsightMenuBody } from "../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/index.js";
import {
    selectInsightsMap,
    selectRenderMode,
    selectSettings,
    useDashboardSelector,
} from "../../../../model/index.js";
import { IInsightMenuSubmenu } from "../../insightMenu/index.js";
import { useEditableInsightMenu } from "../../widget/InsightWidget/useEditableInsightMenu.js";
import { useIntl } from "react-intl";
import { ConfigurationBubble } from "../../common/configuration/ConfigurationBubble.js";
import { getSizeInfo } from "../../../../_staging/layout/sizing.js";
import { InsightList } from "../../../insightList/index.js";

interface ToolbarProps {
    widget: IVisualizationSwitcherWidget;
    onVisualizationsChanged: (visualizations: IInsightWidget[]) => void;
    onVisualizationAdded: (insightWidget: IInsightWidget, sizeInfo: any) => void; // TODO INE any
    onWidgetDelete: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    widget,
    onVisualizationsChanged,
    onVisualizationAdded,
    onWidgetDelete,
}) => {
    const visualizations = widget.visualizations;

    const [isVisualizationsListVisible, setVisualizationsListVisible] = useState(false);

    const [activeVisualizationId, setActiveVisualizationId] = useState(visualizations[0]?.identifier);
    const settings = useDashboardSelector(selectSettings);

    const onVisualizationAdd = useCallback(
        (insight: IInsight) => {
            const sizeInfo = getSizeInfo(settings, "insight", insight);
            const identifier = uuid();

            const newWidget: IInsightWidget = {
                type: "insight",
                insight: insightRef(insight),
                ignoreDashboardFilters: [],
                drills: [],
                title: insightTitle(insight),
                description: "",
                identifier,
                localIdentifier: identifier,
                uri: "",
                ref: idRef(identifier),
            };
            onVisualizationAdded(newWidget, sizeInfo);
        },
        [onVisualizationAdded, settings],
    );

    const onVisualizationDelete = useCallback(
        (widgetId: string) => {
            onVisualizationsChanged(
                visualizations.filter((visualization) => visualization.identifier !== widgetId),
            );
        },
        [onVisualizationsChanged, visualizations],
    );

    const toggleVisualizationsList = () => {
        setVisualizationsListVisible(!isVisualizationsListVisible);
    };

    const onNavigate = useCallback((identifier: string) => {
        setActiveVisualizationId(identifier);
    }, []);

    const activeVisualization = visualizations.find(
        (visualization) => visualization.identifier === activeVisualizationId,
    );

    return (
        <>
            <ConfigurationBubble
                classNames={cx(
                    "edit-insight-config",
                    "s-edit-insight-config",
                    "edit-insight-config-title-1-line",
                    "edit-insight-config-arrow-color",
                )}
                showArrow={false}
            >
                <ToolbarBody
                    visualizations={visualizations}
                    onNavigate={onNavigate}
                    activeVisualizationId={activeVisualizationId}
                    onDelete={onWidgetDelete}
                    toggleVisualizationsList={toggleVisualizationsList}
                />
                {isVisualizationsListVisible || !activeVisualization ? (
                    <VisualizationsList
                        visualizations={visualizations}
                        onVisualizationAdd={onVisualizationAdd}
                        onVisualizationDeleted={onVisualizationDelete}
                    />
                ) : (
                    <VisualizationConfig widget={activeVisualization} />
                )}
            </ConfigurationBubble>
        </>
    );
};

interface ToolbarBodyProps {
    visualizations: IInsightWidget[];
    activeVisualizationId: string | undefined;
    onNavigate: (widgetId: string) => void;
    onDelete: () => void;
    toggleVisualizationsList: () => void;
}

const ToolbarBody: React.FC<ToolbarBodyProps> = ({
    visualizations,
    onNavigate,
    activeVisualizationId: activeWidgetId,
    onDelete,
    toggleVisualizationsList,
}) => {
    const theme = useTheme();
    const activeWidgetIndex = visualizations.findIndex(() => activeWidgetId);

    const prevDisabled = activeWidgetIndex <= 0;
    const nextDisabled = activeWidgetIndex === -1 || activeWidgetIndex >= visualizations.length;

    const iconColor = theme?.palette?.complementary?.c6 ?? gdColorStateBlank;

    const enabledColor = theme?.palette?.complementary?.c7 ?? "#6D7680";
    const disabledColor = theme?.palette?.complementary?.c5 ?? "#B0BECA";

    const prevColor = prevDisabled ? disabledColor : enabledColor;
    const nextColor = nextDisabled ? disabledColor : enabledColor;

    const onNavigatePrev = useCallback(() => {
        if (prevDisabled) {
            return;
        }
        const prevIndex = activeWidgetIndex - 1;
        const prevWidgetId = visualizations[prevIndex].identifier;
        onNavigate(prevWidgetId);
    }, [activeWidgetIndex, visualizations, onNavigate, prevDisabled]);

    const onNavigateNext = useCallback(() => {
        if (nextDisabled) {
            return;
        }
        const nextIndex = activeWidgetIndex + 1;
        const nextWidgetId = visualizations[nextIndex].identifier;
        onNavigate(nextWidgetId);
    }, [activeWidgetIndex, visualizations, onNavigate, nextDisabled]);

    return (
        <div className="visualization-switcher-toolbar-container">
            <div className="left-section" onClick={toggleVisualizationsList}>
                <Icon.VisualizationSwitcher color={iconColor} />
            </div>
            <div className="divider" />
            <div className="middle-section">
                <div className="navigate-prev" onClick={onNavigatePrev}>
                    <Icon.ArrowLeft color={prevColor} />
                </div>
                <div className="status">
                    {activeWidgetIndex + 1} / {visualizations.length}
                </div>
                <div className="navigate-next" onClick={onNavigateNext}>
                    <Icon.ArrowRight color={nextColor} />
                </div>
            </div>
            <div className="divider" />
            <div className="right-section">
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-trash s-visualization-switcher-remove-button"
                    onClick={onDelete}
                />
            </div>
        </div>
    );
};

interface VisualizationsListProps {
    visualizations: IInsightWidget[];
    onVisualizationAdd: (insight: IInsight) => void;
    onVisualizationDeleted: (widgetId: string) => void;
}

const VisualizationsList: React.FC<VisualizationsListProps> = ({
    visualizations,
    onVisualizationDeleted,
    onVisualizationAdd,
}) => {
    const [isVisualizationPickerVisible, setVisualizationPickerVisible] = React.useState(false);

    const intl = useIntl();

    const onAdd = () => {
        setVisualizationPickerVisible(!isVisualizationPickerVisible);
    };

    const onAdded = (insight: IInsight) => {
        onVisualizationAdd(insight);
        setVisualizationPickerVisible(false);
    };
    return isVisualizationPickerVisible ? (
        <VisualizationPicker onVisualizationSelect={onAdded} />
    ) : (
        <div className="edit-insight-config">
            <div className="insight-configuration">
                <div className="insight-configuration-panel-header">
                    <Typography tagName="h3" className="widget-title">
                        <span>
                            {intl.formatMessage({
                                id: "visualizationSwitcherToolbar.visualizationsList.header",
                            })}
                        </span>
                    </Typography>
                </div>
                {visualizations.length === 0 && (
                    <div>
                        {intl.formatMessage({ id: "visualizationSwitcherToolbar.visualizationsList.empty" })}
                    </div>
                )}
                {visualizations.map((visualization) => (
                    <div key={visualization.identifier}>
                        {visualization.title}
                        <Button
                            className="gd-button-link gd-button-icon-only gd-icon-trash s-visualization-switcher-remove-button"
                            onClick={() => onVisualizationDeleted(visualization.identifier)}
                        />
                    </div>
                ))}
                <Button
                    className="gd-button-link gd-icon-plus s-visualization-switcher-add-button"
                    onClick={onAdd}
                >
                    {intl.formatMessage({ id: "visualizationSwitcherToolbar.visualizationsList.add" })}
                </Button>
            </div>
        </div>
    );
};

const VisualizationConfig: React.FC<{ widget: IInsightWidget }> = ({ widget }) => {
    const insights = useDashboardSelector(selectInsightsMap);
    const insight = insights.get(widget.insight);

    if (!insight) {
        // eslint-disable-next-line no-console
        console.debug(
            "DefaultDashboardInsightWidget rendered before the insights were ready, skipping render.",
        );
        return null;
    }

    return <VisualizationConfigContent widget={widget} insight={insight} />;
};

const VisualizationConfigContent: React.FC<{ widget: IInsightWidget; insight: IInsight }> = ({
    widget,
    insight,
}) => {
    const { menuItems } = useEditableInsightMenu({
        widget,
        insight,
        closeMenu: noop,
    });
    const renderMode = useDashboardSelector(selectRenderMode);
    const [submenu, setSubmenu] = useState<IInsightMenuSubmenu | null>(null);

    return (
        <DashboardInsightMenuBody
            widget={widget}
            insight={insight}
            items={menuItems}
            submenu={submenu}
            setSubmenu={setSubmenu}
            renderMode={renderMode}
            isOpen={true}
            onClose={noop}
        />
    );
};

interface IVisualizationPickerProps {
    onVisualizationSelect: (insight: IInsight) => void;
}

const VisualizationPicker: React.FC<IVisualizationPickerProps> = ({ onVisualizationSelect }) => {
    return (
        <div className="visualization-picker">
            <div className="open-visualizations s-open-visualizations">
                <InsightList
                    height={300}
                    width={275}
                    searchAutofocus={true}
                    onSelect={(insight) => {
                        onVisualizationSelect(insight);
                    }}
                />
            </div>
        </div>
    );
};
