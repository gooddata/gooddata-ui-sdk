// (C) 2007-2018 GoodData Corporation
import React from "react";
import unescape from "lodash/unescape";
import { ITheme } from "@gooddata/sdk-backend-spi";
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
    public render(): React.ReactNode {
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

        const onItemClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            return this.props.onItemClick(item);
        };

        return (
            <div style={style} className="series-item" onClick={onItemClick}>
                <div className="series-icon" style={iconStyle} />
                <div className="series-name" style={nameStyle} title={unescape(item.name)}>
                    {item.name}
                </div>
            </div>
        );
    }
}

export default withTheme(LegendItem);
