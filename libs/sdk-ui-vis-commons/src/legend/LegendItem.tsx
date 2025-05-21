// (C) 2007-2025 GoodData Corporation
import React from "react";
import unescape from "lodash/unescape.js";
import { ITheme } from "@gooddata/sdk-model";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { ISeriesItem } from "./types.js";
import { LegendSeriesContextStore } from "./context.js";

const DEFAULT_DISABLED_COLOR = "#CCCCCC";

interface ILegendItemProps {
    item: ISeriesItem;
    width?: number;
    enableBorderRadius?: boolean;
    onItemClick: (item: ISeriesItem) => void;
    theme?: ITheme;
}

const LegendItem: React.FC<ILegendItemProps> = ({
    item,
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

    const legendItemId = useIdPrefixed("legend-item");

    return (
        <button
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
