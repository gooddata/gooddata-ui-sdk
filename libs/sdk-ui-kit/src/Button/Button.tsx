// (C) 2007-2024 GoodData Corporation
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
        const { id, tagName, title, disabled, tabIndex, type, iconLeft, iconRight } = this.props;
        const TagName = tagName as any;
        const effectiveValue = this.getEffectiveValue();

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
                aria-disabled={disabled}
                aria-label={title}
                role="button"
            >
                {this.renderIcon(iconLeft)}
                {effectiveValue ? <span className="gd-button-text">{effectiveValue}</span> : null}
                {this.renderIcon(iconRight)}
            </TagName>
        );
    }

    private getEffectiveValue() {
        return this.props.value ?? this.props.children;
    }

    private getClassnames() {
        const { className, variant, size, intent, disabled } = this.props;
        const effectiveValue = this.getEffectiveValue();
        const generatedSeleniumClass =
            effectiveValue && typeof effectiveValue === "string"
                ? `s-${stringUtils.simplifyText(effectiveValue)}`
                : "";
        return cx([
            "gd-button",
            generatedSeleniumClass,
            className,
            {
                [`gd-button-${variant}`]: !!variant,
                [`gd-button-${size}`]: !!size,
                [`gd-button-${intent}`]: !!intent,
                disabled: disabled,
            },
        ]);
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
