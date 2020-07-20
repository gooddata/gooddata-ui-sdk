// (C) 2007-2018 GoodData Corporation
import React from "react";
import unescape from "lodash/unescape";

const VISIBLE_COLOR = "#6D7680";
const DISABLED_COLOR = "#CCCCCC";

export class LegendItem extends React.Component<any, any> {
    public static defaultProps: any = {
        width: null,
    };

    public render() {
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
