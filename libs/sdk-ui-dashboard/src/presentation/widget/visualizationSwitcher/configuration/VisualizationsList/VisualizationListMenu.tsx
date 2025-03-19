// (C) 2024 GoodData Corporation

import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { IAlignPoint, ItemsWrapper, Overlay, Separator } from "@gooddata/sdk-ui-kit";
import { IInsightWidget } from "@gooddata/sdk-model";

import { VisualizationListMenuItem } from "./VisualizationListMenuItem.js";

const menuAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

interface IVisualizationListMenu {
    alignTo: string;
    isLast: boolean;
    isFirst: boolean;
    visualization: IInsightWidget;
    shouldRenderActions: boolean;
    onMenuButtonClick: () => void;
    onVisualizationDeleted: (visualizationWidgetId: string) => void;
    onVisualizationPositionChange: (visualizationWidgetId: string, direction: string) => void;
}

export const VisualizationListMenu: React.FC<IVisualizationListMenu> = ({
    alignTo,
    isLast,
    isFirst,
    visualization,
    shouldRenderActions,
    onMenuButtonClick,
    onVisualizationDeleted,
    onVisualizationPositionChange,
}) => {
    const intl = useIntl();

    const handleOnVisualizationPositionChange = useCallback(
        (disabled: boolean, direction: string) => {
            if (disabled) {
                return;
            }
            onVisualizationPositionChange(visualization.identifier, direction);
            onMenuButtonClick();
        },
        [visualization.identifier],
    );

    return (
        <Overlay
            key={"VisSwitcherMoreMenu"}
            alignTo={alignTo}
            alignPoints={menuAlignPoints}
            className="gd-more-menu-overlay"
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            onClose={onMenuButtonClick}
        >
            <ItemsWrapper smallItemsSpacing={true} className=".s-visualization-switcher-more-menu">
                {shouldRenderActions ? (
                    <>
                        <VisualizationListMenuItem
                            className={cx("gd-vis-switcher-show-more-item", { "is-disabled": isFirst })}
                            disabled={isFirst}
                            onClick={() => {
                                handleOnVisualizationPositionChange(isFirst, "moveUp");
                            }}
                            text={intl.formatMessage({ id: "visualizationSwitcher.list.menu.move.up" })}
                        />
                        <VisualizationListMenuItem
                            className={cx("gd-vis-switcher-show-more-item", { "is-disabled": isLast })}
                            disabled={isLast}
                            onClick={() => {
                                handleOnVisualizationPositionChange(isLast, "moveDown");
                            }}
                            text={intl.formatMessage({ id: "visualizationSwitcher.list.menu.move.down" })}
                        />
                        <Separator />
                    </>
                ) : null}
                <VisualizationListMenuItem
                    className="gd-vis-swicher-show-more-item-remove"
                    onClick={() => {
                        onVisualizationDeleted(visualization.identifier);
                        onMenuButtonClick();
                    }}
                    text={intl.formatMessage({ id: "visualizationSwitcher.list.menu.remove" })}
                />
            </ItemsWrapper>
        </Overlay>
    );
};
