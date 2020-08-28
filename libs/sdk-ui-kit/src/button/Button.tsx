// (C) 2007-2020 GoodData Corporation
import React from "react";
import classNames from "classnames";
import { stringUtils } from "@gooddata/util";
import noop from "lodash/noop";
import styled from "styled-components";
import { transparentize, darken, lighten } from "polished";
import { transition, gradientLinear } from "../utils/mixins";
import ButtonText from "./ButtonText";

/**
 * @internal
 */
export type IButtonType = "primary" | "secondary" | "action" | "positive" | "negative";

/**
 * @internal
 */
export interface IButtonProps {
    className?: string;
    disabled?: boolean;
    tabIndex?: number;
    tagName?: string;
    title?: string;
    type?: IButtonType;
    value?: string;
    iconLeft?: string;
    iconRight?: string;
    onClick?(e: React.MouseEvent): void;
}

/**
 * @internal
 */
export class BareButton extends React.PureComponent<IButtonProps> {
    public static defaultProps = {
        className: "",
        disabled: false,
        onClick: noop,
        tabIndex: -1,
        tagName: "button",
        title: "",
        type: "primary",
    };

    public buttonNode: HTMLElement;

    public render() {
        const { tagName, title, value, tabIndex, iconLeft, iconRight } = this.props;
        const TagName = tagName as any;

        return (
            <TagName
                ref={(ref: HTMLElement) => {
                    this.buttonNode = ref;
                }}
                title={title}
                className={this.getClassnames()}
                type={"button"}
                onClick={this.onClick}
                tabIndex={tabIndex}
            >
                {iconLeft && this.renderIcon(iconLeft)}
                {value && <ButtonText>{value}</ButtonText>}
                {iconRight && this.renderIcon(iconRight)}
            </TagName>
        );
    }

    private getClassnames() {
        const { disabled, className } = this.props;
        const { value } = this.props;
        const generatedSeleniumClass = value ? `s-${stringUtils.simplifyText(value)}` : "";

        return classNames({
            [className]: !!className,
            [generatedSeleniumClass]: true,
            disabled,
        });
    }

    private onClick = (e: React.MouseEvent) => {
        const { disabled, onClick } = this.props;

        if (!disabled) {
            onClick(e);
        }
    };

    private renderIcon(icon: string) {
        return <span className={classNames("gd-button-icon", icon)} />;
    }
}

const gdColorText = "#464e56";
const gdColorLight = "#fcfcfd";
const gdColorDisabled = "#b0beca";
const gdColorTextDimmed = gdColorDisabled;

// const buttonIconWidth = "18px";
// const buttonSmallIconWidth = "16px";

const buttonNormalHoverBoxShadow = transparentize(0.4, "#b1c1d1");

const buttonShadowColor = "#14385d";
const buttonShadowLighter = transparentize(0.91, buttonShadowColor);
const buttonShadowDarker = transparentize(0.85, buttonShadowColor);

const getNormalButtonStyles = (fontWeight: number, theme: any) => `
    color: "#778491";
    background-color: "#fcfcfd";
    border-color: "#ccd8e2";
    box-shadow: 0 1px 1px 0 ${buttonShadowDarker};
    font-weight: ${fontWeight};

    &:hover {
        box-shadow: 0 1px 1px 0 ${buttonShadowDarker}, inset 0 -1px 0 0 ${buttonNormalHoverBoxShadow};
        color: ${gdColorText};
        background: "#f5f8fa";
        border-color: transparentize(0.8, "#1f3449");
    }

    &:focus,
    &.is-focus {
        box-shadow: 0 0 3px 1px ${transparentize(
    0.5,
    lighten(0.12, theme.colors.primary.main),
)}, 0 1px 2px 0 ${buttonShadowDarker},
            inset 0 -1px 0 0 ${buttonNormalHoverBoxShadow};
        border-color: ${transparentize(0.25, theme.colors.primary.main)});
    }

    &:active,
    &.is-active {
        box-shadow: inset 0 1px 0 0 ${transparentize(0.35, "#b1c1d1")};
        color: ${gdColorText};
        border-color: "#b1c1d1";
        ${gradientLinear("#dee6ef", "#ecf0f5")};
    }

    &.disabled {
        cursor: default;

        &,
        &:hover,
        &:focus,
        &:active {
            color: ${gdColorDisabled};
            background: ${transparentize(0.7, gdColorLight)};
            border-color: rgba(210, 219, 227, 0.75);
        }
    }
`;

const getButtonStyles = (color: string, contrast: string) => `
    color: ${contrast};
    background-color: ${color};
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-weight: 700;
    box-shadow: 0 1px 0 0 ${buttonShadowLighter};
    
    &:hover {
        box-shadow: 0 1px 1px 0 ${buttonShadowDarker}, inset 0 -1px 0 0 rgba(0, 0, 0, 0.15);
        background: ${darken(0.1, color)};
    }
    
    &:focus {
        box-shadow: 0 0 3px 1px ${transparentize(
            0.4,
            lighten(0.1, color),
        )}, 0 1px 1px 0 ${buttonShadowDarker};
        inset 0 -1px 0 0 rgba(0, 0, 0, 0.15);
    }
    
    &:active,
    &.is-active {
        box-shadow: inset 0 2px 0 0 rgba(0, 0, 0, 0.15);
        ${gradientLinear(darken(0.2, color), darken(0.1, color))}
    }
    
    &.disabled {
        cursor: default;

        &,
        &:hover,
        &:focus,
        &:active {
            color: ${contrast};
            background: ${transparentize(0.4, lighten(0.2, color))};
        }
    }
`;

const getButtonVariant = (type: IButtonType, theme: any) => {
    switch (type) {
        case "primary":
            return getNormalButtonStyles(700, theme);
        case "secondary":
            return getNormalButtonStyles(400, theme);
        case "action":
            return getButtonStyles(theme.colors.primary.main, theme.colors.primary.contrast);
        case "negative":
        case "positive":
            return getButtonStyles(theme.colors[type].main, theme.colors[type].contrast);
    }
};

const getFont = (theme: any) => {
    const { fontSize, fontFamily, lineHeight } = theme.typography.button;
    return `
        font-size: ${fontSize};
        font-family: ${fontFamily};
        line-height: ${lineHeight};
    `;
};

/**
 * @internal
 */
export const Button = styled(BareButton)`
    position: relative;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 14px;
    border: 1px solid transparent;
    ${(props) => getFont(props.theme)}
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    text-align: left;
    border-radius: 3px;
    outline: 0;
    ${transition("all", 0.25, "ease-in-out")}

    & + & {
        margin-left: 10px;
    }

    &::before,
    &::after {
        position: absolute;
        top: 50%;
        height: 20px;
        line-height: 20px;
        color: ${gdColorTextDimmed};
        transform: translateY(-50%);
        font-size: 18px;
        text-align: center;

        ${transition("color", 0.25, "ease-in-out")}
    }

    &::before {
        left: 10px;
        margin-right: 0.5em;
    }

    &::after {
        right: 7px;
        margin-left: 0.5em;
    }

    &:active:not(.disabled) {
        &::before,
        &::after {
            top: calc(50% + 1px);
        }

        ${ButtonText} {
            top: 2px;
        }
    }

    &.disabled {
        &,
        &:hover,
        &:focus,
        &:active {
            box-shadow: none;
            background: transparent;
            cursor: default;
            border-color: transparent;
            text-decoration: none;
        }
    }

    ${(props) => getButtonVariant(props.type, props.theme)}
`;
