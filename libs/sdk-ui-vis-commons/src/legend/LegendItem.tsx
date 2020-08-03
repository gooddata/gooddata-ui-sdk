// (C) 2007-2018 GoodData Corporation
import React from "react";
import unescape from "lodash/unescape";

const VISIBLE_COLOR = "#6D7680";
const DISABLED_COLOR = "#CCCCCC";

interface ILegendItemProps {
    item: any;
    width?: number;
    enableBorderRadius?: boolean;
    onItemClick: (item: any) => void;
}

export class LegendItem extends React.Component<ILegendItemProps> {
    public render(): React.ReactNode {
        const { item, width, enableBorderRadius = false } = this.props;
        const iconStyle = {
            borderRadius: enableBorderRadius ? "50%" : "0",
            backgroundColor: item.isVisible ? item.color : DISABLED_COLOR,
        };

        const nameStyle = {
            color: item.isVisible ? VISIBLE_COLOR : DISABLED_COLOR,
        };

        const style = width ? { width: `${width}px` } : {};

        const onItemClick = () => {
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
