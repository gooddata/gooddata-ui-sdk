// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import noop from "lodash/noop.js";
import { IButtonProps } from "./typings.js";

/**
 * @internal
 */
export class Button extends React.Component<IButtonProps> {
    public static defaultProps = {
        className: "",
        disabled: false,
        onClick: noop,
        tabIndex: -1,
        tagName: "button",
        title: "",
        type: "button",
        value: "",
        iconLeft: null as string,
        iconRight: null as string,
    };

    public buttonNode: HTMLElement;

    public render() {
        const { id, tagName, title, value, tabIndex, type, iconLeft, iconRight } = this.props;
        const TagName = tagName as any;

        return (
            <TagName
                id={id}
                ref={(ref: HTMLElement) => {
                    this.buttonNode = ref;
                }}
                title={title}
                className={this.getClassnames()}
                type={type}
                onClick={this._onClick}
                tabIndex={tabIndex}
            >
                {this.renderIcon(iconLeft)}
                {value ? <span className="gd-button-text">{value}</span> : null}
                {this.renderIcon(iconRight)}
            </TagName>
        );
    }

    private getClassnames() {
        const { value } = this.props;
        const generatedSeleniumClass =
            value && typeof value === "string" ? `s-${stringUtils.simplifyText(value)}` : "";

        return cx({
            [this.props.className]: !!this.props.className,
            [generatedSeleniumClass]: true,
            ["gd-button"]: true,
            disabled: this.props.disabled,
        });
    }

    private _onClick = (e: React.MouseEvent) => {
        if (!this.props.disabled) {
            this.props.onClick(e);
        }
    };

    private renderIcon(icon: string) {
        if (!icon) {
            return null;
        }

        return <span className={cx("gd-button-icon", icon)} role="button-icon" />;
    }
}
