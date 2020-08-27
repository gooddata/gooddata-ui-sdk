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

// const buttonStyleProps = {
//     font: 'avenir, "Helvetica Neue", arial, sans-serif;',
//     color: "#778491",
//     backgroundColor: "#fcfcfd",
//     borderColor: "#ccd8e2",
//     shadowColor: transparentize(0.85, "#14385d"),
//     shadowInsetColor: transparentize(0.4, "#b1c1d1"),
// };

const gdColorHighlight = "#14b2e2";
const gdColorPositive = "#00c18d";
const gdColorNegative = "#e54d42";
const gdColorText = "#464e56";
const gdColorTextLight = "#fff";
const gdColorLight = "#fcfcfd";
const gdFontPrimary = 'avenir, "Helvetica Neue", arial, sans-serif';
const gdColorDisabled = "#b0beca";
const gdColorTextDimmed = gdColorDisabled;

// const buttonIconWidth = "18px";
// const buttonSmallIconWidth = "16px";

// const buttonActionColor = gdColorHighlight;
// const buttonActionColorHover = gdColorText;

const buttonNormalBg = gdColorLight;
const buttonNormalColor = "#778491";
const buttonNormalBorderColor = "#ccd8e2";
const buttonNormalHoverBg = "#f5f8fa";
const buttonNormalHoverBorderColor = transparentize(0.8, "#1f3449");
const buttonNormalActiveGradientTop = "#dee6ef";
const buttonNormalActiveGradientBottom = "#ecf0f5";
const buttonNormalActiveBorderColor = "#b1c1d1";
const buttonNormalActiveShadow = transparentize(0.35, buttonNormalActiveBorderColor);
const buttonNormalHoverBoxShadow = transparentize(0.4, buttonNormalActiveBorderColor);

const buttonShadowColor = "#14385d";
const buttonShadowLighter = transparentize(0.91, buttonShadowColor);
const buttonShadowDarker = transparentize(0.85, buttonShadowColor);

// Branded colors calculation

const buttonActionBg = gdColorHighlight;
const buttonActionDisabledBg = transparentize(0.4, lighten(0.12, buttonActionBg));
const buttonActionHoverBg = darken(0.06, buttonActionBg);
const buttonActionFocusShadow = transparentize(0.4, lighten(0.06, buttonActionBg));
const buttonActionActiveGradientTop = darken(0.12, buttonActionBg);
const buttonActionActiveGradientBottom = buttonActionHoverBg;

const buttonNormalFocusShadow = transparentize(0.7, buttonActionDisabledBg);

const buttonPositiveBg = gdColorPositive;
const buttonPositiveDisabledBg = transparentize(0.5, lighten(0.06, buttonPositiveBg));
const buttonPositiveHoverBg = darken(0.06, buttonPositiveBg);
const buttonPositiveFocusShadow = transparentize(0.5, lighten(0.06, buttonPositiveBg));
const buttonPositiveActiveGradientTop = darken(0.12, buttonPositiveBg);
const buttonPositiveActiveGradientBottom = buttonPositiveHoverBg;

const buttonNegativeBg = gdColorNegative;
const buttonNegativeDisabledBg = transparentize(0.4, lighten(0.2, buttonNegativeBg));
const buttonNegativeHoverBg = darken(0.1, buttonNegativeBg);
const buttonNegativeFocusShadow = transparentize(0.4, lighten(0.1, buttonNegativeBg));
const buttonNegativeActiveGradientTop = darken(0.2, buttonNegativeBg);
const buttonNegativeActiveGradientBottom = buttonNegativeHoverBg;

// const colorPalette = {
//     action: {
//         main: gdColorHighlight,
//         contrast: gdColorTextLight,
//     },
//     positive: gdColorPositive,
//     negative: gdColorNegative,
// };

const normalButtonBase = `
    color: ${buttonNormalColor};
    background-color: ${buttonNormalBg};
    border-color: ${buttonNormalBorderColor};
    box-shadow: 0 1px 1px 0 ${buttonShadowDarker};
    
    &:hover {
        box-shadow: 0 1px 1px 0 ${buttonShadowDarker}, inset 0 -1px 0 0 ${buttonNormalHoverBoxShadow};
        color: ${gdColorText};
        background: ${buttonNormalHoverBg};
        border-color: ${buttonNormalHoverBorderColor};
    }

    &:focus,
    &.is-focus {
        box-shadow: 0 0 3px 1px ${buttonNormalFocusShadow}, 0 1px 2px 0 ${buttonShadowDarker};
            inset 0 -1px 0 0 ${buttonNormalHoverBoxShadow};
        border-color: ${transparentize(0.25, gdColorHighlight)};
    }

    &:active,
    &.is-active {
        box-shadow: inset 0 1px 0 0 ${buttonNormalActiveShadow};
        color: ${gdColorText};
        border-color: ${buttonNormalActiveBorderColor};
        ${gradientLinear(buttonNormalActiveGradientTop, buttonNormalActiveGradientBottom)};
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

const buttonVariants = {
    primary: `
        ${normalButtonBase}
        font-weight: 700;
    `,
    secondary: `
        ${normalButtonBase}
        font-weight: 400;
    `,
    action: `
        color: ${gdColorTextLight};
        background-color: ${gdColorHighlight};
        border: 1px solid rgba(0, 0, 0, 0.1);
        font-weight: 700;
        box-shadow: 1px 1px 0 ${buttonShadowLighter};
        
        &:hover {
            box-shadow: 0 1px 1px 0 ${buttonShadowDarker}, inset 0 -1px 0 0 rgba(0, 0, 0, 0.15);
            background: ${buttonActionHoverBg};
        }
        
        &:focus {
            box-shadow: 0 0 3px 1px ${buttonActionFocusShadow}, 0 1px 1px 0 ${buttonShadowDarker};
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.15);
        }
        
        &:active,
        &.is-active {
            box-shadow: inset 0 2px 0 0 rgba(0, 0, 0, 0.15);
            ${gradientLinear(buttonActionActiveGradientTop, buttonActionActiveGradientBottom)}
        }
        
        &.disabled {
            cursor: default;
    
            &,
            &:hover,
            &:focus,
            &:active {
                color: ${gdColorTextLight};
                background: ${buttonActionDisabledBg};
            }
        }
    `,
    negative: `
        color: ${gdColorTextLight};
        background-color: ${buttonNegativeBg};
        border: 1px solid rgba(0, 0, 0, 0.1);
        font-weight: 700;
        box-shadow: 0 1px 0 0 ${buttonShadowLighter};
        
        &:hover {
            box-shadow: 0 1px 1px 0 ${buttonShadowDarker}, inset 0 -1px 0 0 rgba(0, 0, 0, 0.15);
            background: ${buttonNegativeHoverBg};
        }
        
        &:focus {
            box-shadow: 0 0 3px 1px ${buttonNegativeFocusShadow}, 0 1px 1px 0 ${buttonShadowDarker};
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.15);
        }
        
        &:active,
        &.is-active {
            box-shadow: inset 0 2px 0 0 rgba(0, 0, 0, 0.15);
            ${gradientLinear(buttonNegativeActiveGradientTop, buttonNegativeActiveGradientBottom)}
        }
        
        &.disabled {
            cursor: default;
    
            &,
            &:hover,
            &:focus,
            &:active {
                color: ${gdColorTextLight};
                background: ${buttonNegativeDisabledBg};
            }
        }
    `,
    positive: `
        color: ${gdColorTextLight};
        background-color: ${buttonPositiveBg};
        border: 1px solid rgba(0, 0, 0, 0.1);
        font-weight: 700;
        box-shadow: 0 1px 0 0 ${buttonShadowLighter};
        
        &:hover {
            box-shadow: 0 1px 1px 0 ${buttonShadowDarker}, inset 0 -1px 0 0 rgba(0, 0, 0, 0.15);
            background: ${buttonPositiveHoverBg};
        }
        
        &:focus {
            box-shadow: 0 0 3px 1px ${buttonPositiveFocusShadow}, 0 1px 1px 0 ${buttonShadowDarker};
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.15);
        }
        
        &:active,
        &.is-active {
            box-shadow: inset 0 2px 0 0 rgba(0, 0, 0, 0.15);
            ${gradientLinear(buttonPositiveActiveGradientTop, buttonPositiveActiveGradientBottom)}
        }
        
        &.disabled {
            cursor: default;
    
            &,
            &:hover,
            &:focus,
            &:active {
                color: ${gdColorTextLight};
                background: ${buttonPositiveDisabledBg};
            }
        }
    `,
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
    font: 14px/20px ${gdFontPrimary};
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
    
    ${(props) => buttonVariants[props.type]}
`;
