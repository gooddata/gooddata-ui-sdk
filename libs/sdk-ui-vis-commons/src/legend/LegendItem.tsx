// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import unescape from "lodash/unescape.js";

import { ITheme } from "@gooddata/sdk-model";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { LegendSeriesContextStore, useItemVisibility } from "./context.js";
import { ISeriesItem } from "./types.js";

const DEFAULT_DISABLED_COLOR = "#CCCCCC";

interface ILegendItemProps {
    item: ISeriesItem;
    index: number;
    width?: number;
    enableBorderRadius?: boolean;
    onItemClick: (item: ISeriesItem) => void;
    theme?: ITheme;
}

const LegendItem: React.FC<ILegendItemProps> = ({
    item,
    index,
    width,
    enableBorderRadius = false,
    onItemClick,
    theme,
}) => {
    const { descriptionId, isFocused, id } = LegendSeriesContextStore.useContextStore((ctx) => ({
        descriptionId: ctx.descriptionId,
        isFocused: ctx.focusedItem === item,
        id: ctx.makeItemId(item),
    }));
    const { registerItem } = useItemVisibility();

    const disabledColor = theme?.palette?.complementary?.c5 ?? DEFAULT_DISABLED_COLOR;

    const iconStyle = {
        borderRadius: enableBorderRadius ? "50%" : "0",
        backgroundColor: item.isVisible ? item.color : disabledColor,
    };

    // normal state styled by css
    const nameStyle = item.isVisible
        ? {}
        : {
              color: disabledColor,
          };

    const style = width ? { width: `${width}px` } : {};

    const handleItemClick = () => {
        return onItemClick(item);
    };

    const refCallback = React.useCallback(
        (element: HTMLButtonElement | null) => {
            if (element) {
                registerItem(index, element);
            } else {
                // Element is unmounted, unregister it
                registerItem(index, null);
            }
        },
        [index, registerItem],
    );

    const legendItemId = useIdPrefixed("legend-item");

    return (
        <button
            ref={refCallback}
            data-testid={"legend-item"}
            role={"switch"}
            aria-describedby={descriptionId}
            aria-checked={item.isVisible}
            id={id}
            style={style}
            className={cx("series-item", { "series-item--isFocused": isFocused })}
            onClick={handleItemClick}
            aria-labelledby={legendItemId}
            title={unescape(item.name)}
            tabIndex={-1}
        >
            <div className="series-icon" style={iconStyle} />
            <div id={legendItemId} className="series-name" style={nameStyle}>
                {item.name}
            </div>
        </button>
    );
};

export default withTheme(LegendItem);
