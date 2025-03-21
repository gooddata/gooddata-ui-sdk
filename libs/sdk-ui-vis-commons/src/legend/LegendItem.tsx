// (C) 2007-2025 GoodData Corporation
import React from "react";
import unescape from "lodash/unescape.js";
import { ITheme } from "@gooddata/sdk-model";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";
import { useId } from "@gooddata/sdk-ui-kit";

const DEFAULT_DISABLED_COLOR = "#CCCCCC";

interface ILegendItemProps {
    item: any;
    width?: number;
    enableBorderRadius?: boolean;
    onItemClick: (item: any) => void;
    theme?: ITheme;
}

const LegendItem: React.FC<ILegendItemProps> = ({
    item,
    width,
    enableBorderRadius = false,
    onItemClick,
    theme,
}) => {
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

    const id = useId();
    const legendItemId = `legend-item-${id}`;

    return (
        <button
            data-testid={"legend-item"}
            style={style}
            className="series-item"
            onClick={handleItemClick}
            aria-labelledby={legendItemId}
            title={unescape(item.name)}
        >
            <div className="series-icon" style={iconStyle} />
            <div id={legendItemId} className="series-name" style={nameStyle}>
                {item.name}
            </div>
        </button>
    );
};

export default withTheme(LegendItem);
