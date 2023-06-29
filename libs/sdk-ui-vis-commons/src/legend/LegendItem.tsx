// (C) 2007-2023 GoodData Corporation
import React from "react";
import unescape from "lodash/unescape.js";
import { ITheme } from "@gooddata/sdk-model";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

const DEFAULT_DISABLED_COLOR = "#CCCCCC";

interface ILegendItemProps {
    item: any;
    width?: number;
    enableBorderRadius?: boolean;
    onItemClick: (item: any) => void;
    theme?: ITheme;
}

class LegendItem extends React.Component<ILegendItemProps> {
    public render() {
        const { item, width, enableBorderRadius = false, theme } = this.props;
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

        const onItemClick = () => {
            return this.props.onItemClick(item);
        };

        return (
            <div style={style} className="series-item" onClick={onItemClick} aria-label="Legend item">
                <div className="series-icon" style={iconStyle} />
                <div className="series-name" style={nameStyle} title={unescape(item.name)}>
                    {item.name}
                </div>
            </div>
        );
    }
}

export default withTheme(LegendItem);
