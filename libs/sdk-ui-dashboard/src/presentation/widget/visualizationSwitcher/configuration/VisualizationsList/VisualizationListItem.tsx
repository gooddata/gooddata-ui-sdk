// (C) 2024-2026 GoodData Corporation

import { useCallback, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IInsight, type IInsightWidget, insightVisualizationType } from "@gooddata/sdk-model";
import {
    Button,
    type IAlignPoint,
    InsightListItemTypeIcon,
    ShortenedText,
    UiIcon,
} from "@gooddata/sdk-ui-kit";

import { useIsWidgetRestricted } from "../../../../../model/react/useIsWidgetRestricted.js";

import { VisualizationListMenu } from "./VisualizationListMenu.js";

const visualizationIconWidthAndPadding = 42;
const tooltipAlignPoints: IAlignPoint[] = [
    {
        align: "cr cl",
    },
    {
        align: "cl cr",
        offset: {
            x: -visualizationIconWidthAndPadding,
            y: 0,
        },
    },
];

interface IVisualizationListItemProps {
    visualization: IInsightWidget;
    insight: IInsight;
    isActive: boolean;
    isLast: boolean;
    isFirst: boolean;
    shouldRenderActions: boolean;
    onVisualizationDeleted: (visualizationWidgetId: string) => void;
    onVisualizationSelect: (visualizationWidgetId: string) => void;
    onVisualizationPositionChange: (visualizationWidgetId: string, direction: string) => void;
}

export function VisualizationListItem({
    visualization,
    insight,
    isActive,
    isLast,
    isFirst,
    shouldRenderActions,
    onVisualizationDeleted,
    onVisualizationSelect,
    onVisualizationPositionChange,
}: IVisualizationListItemProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [active, setActive] = useState<string>("");
    const intl = useIntl();
    const isRestricted = useIsWidgetRestricted(visualization);

    const onMenuButtonClick = useCallback(() => {
        setIsOpen(!isOpen);
        setActive("");
    }, [isOpen]);

    const handleClick = useCallback(
        (id: string) => {
            setIsOpen(!isOpen);
            setActive(id);
        },
        [isOpen],
    );

    return (
        <>
            <div
                key={visualization.identifier}
                className={cx("switcher-visualizations-list-item", {
                    "is-selected": isActive,
                    "is-active": active === visualization.identifier,
                })}
            >
                <div
                    className="switcher-visualizations-list-item-content"
                    onClick={() => onVisualizationSelect(visualization.identifier)}
                >
                    <div className="visualization-title">
                        {isRestricted ? (
                            <UiIcon type="lock" size={14} color="complementary-7" />
                        ) : insight ? (
                            <InsightListItemTypeIcon type={insightVisualizationType(insight)} />
                        ) : null}
                        <div className="gd-visualizations-list-item-content">
                            <div className="gd-visualizations-list-item-content-name">
                                <ShortenedText
                                    className="gd-visualizations-list-item-content-name-text"
                                    tooltipAlignPoints={tooltipAlignPoints}
                                >
                                    {isRestricted
                                        ? intl.formatMessage({ id: "visualizationSwitcher.restrictedEntry" })
                                        : visualization.title}
                                </ShortenedText>
                            </div>
                        </div>
                    </div>
                </div>
                <Button
                    key={visualization.identifier}
                    onClick={() => handleClick(visualization.identifier)}
                    value="&#8943;"
                    className={cx(
                        `gd-vis-switcher-show-more-button gd-button s-visualization-switcher-more-menu-button-${visualization.identifier}`,
                        {
                            "is-active": active === visualization.identifier,
                        },
                    )}
                />
            </div>
            {isOpen ? (
                <VisualizationListMenu
                    alignTo={`.s-visualization-switcher-more-menu-button-${visualization.identifier}`}
                    visualization={visualization}
                    isLast={isLast}
                    isFirst={isFirst}
                    // the editor cannot read the visualization, so it cannot judge where in the order
                    // the entry belongs; removal is the only change it can make
                    shouldRenderActions={shouldRenderActions && !isRestricted}
                    onMenuButtonClick={onMenuButtonClick}
                    onVisualizationDeleted={onVisualizationDeleted}
                    onVisualizationPositionChange={onVisualizationPositionChange}
                />
            ) : null}
        </>
    );
}
