// (C) 2007-2020 GoodData Corporation
import * as React from "react";
import classNames from "classnames";
// import { string } from "@gooddata/js-utils";
import noop from "lodash/noop";
import styled from "styled-components";
import { transparentize, lighten } from "polished";
import { gradientLinear, transition } from "../utils/mixins";

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
        value: "",
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
                {value && <span className="gd-button-text">{value}</span>}
                {iconRight && this.renderIcon(iconRight)}
            </TagName>
        );
    }

    private getClassnames() {
        const { disabled, className } = this.props;
        // const { value } = this.props;
        // const generatedSeleniumClass = value ? `s-${string.simplifyText(value)}` : "";

        return classNames({
            [className]: !!className,
            // [generatedSeleniumClass]: true,
            ["gd-button"]: true,
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
// const gdColorText = "#464e56";
const gdColorTextLight = "#fff";
const gdColorLight = "#fcfcfd";
const gdFontPrimary = 'avenir, "Helvetica Neue", arial, sans-serif';
const gdColorDisabled = "#b0beca";
const gdColorTextDimmed = gdColorDisabled;

const buttonIconWidth = "18px";
// const buttonSmallIconWidth = "16px";

// Gray colors

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
// const buttonActionHoverBg = darken(0.06, buttonActionBg);
// const buttonActionFocusShadow = transparentize(0.4, lighten(0.06, buttonActionBg));
// const buttonActionActiveGradientTop = darken(0.12, buttonActionBg);
// const buttonActionActiveGradientBottom = buttonActionHoverBg;

const buttonNormalFocusShadow = transparentize(0.7, buttonActionDisabledBg);

// const buttonPositiveBg = gdColorPositive;
// const buttonPositiveDisabledBg = transparentize(0.5, lighten(0.06, buttonPositiveBg));
// const buttonPositiveHoverBg = darken(0.06, buttonPositiveBg);
// const buttonPositiveFocusShadow = transparentize(0.5, lighten(0.06, buttonPositiveBg));
// const buttonPositiveActiveGradientTop = darken(0.12, buttonPositiveBg);
// const buttonPositiveActiveGradientBottom = buttonPositiveHoverBg;

// const buttonNegativeBg = gdColorNegative;
// const buttonNegativeDisabledBg = transparentize(0.4, lighten(0.2, buttonNegativeBg));
// const buttonNegativeHoverBg = darken(0.1, buttonNegativeBg);
// const buttonNegativeFocusShadow = transparentize(0.4, lighten(0.1, buttonNegativeBg));
// const buttonNegativeActiveGradientTop = darken(0.2, buttonNegativeBg);
// const buttonNegativeActiveGradientBottom = buttonNegativeHoverBg;

const colorPalette = {
    action: {
        main: gdColorHighlight,
    },
    positive: gdColorPositive,
    negative: gdColorNegative,
};

const isBasic = (type: IButtonType) => type === "primary" || type === "secondary";

const boxShadowColor = (type: IButtonType) => (isBasic(type) ? buttonShadowDarker : buttonShadowLighter);

const getBorder = (type: IButtonType) => `
    border: 1px solid ${isBasic(type) ? buttonNormalBorderColor : `rgba(0, 0, 0, 0.1)`};
`;

const getColor = (type: IButtonType) => `
    color: ${isBasic(type) ? buttonNormalColor : gdColorTextLight};
`;

const getBackgroundColor = (type: IButtonType) => {
    switch (type) {
        case "primary":
        case "secondary":
            return buttonNormalBg;
        case "positive":
            return gdColorPositive;
        case "negative":
            return gdColorNegative;
        case "action":
            return gdColorHighlight;
    }
};

const getStyles = ({ type }: IButtonProps) => `// former mixin begin
    position: relative;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 14px;
    border: ${getBorder(type)};
    font: 400 14px/20px ${gdFontPrimary};
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    text-align: left;
    border-radius: 3px;
    ${transition("all", 0.25, "ease-in-out")}

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

    .gd-button-text,
    .gd-button-icon {
        position: relative;
        display: block;
        justify-content: space-between;
        align-items: center;
    }

    .gd-button-text {
        top: 1px;
        flex: 1 1 auto;
        overflow: hidden;
        width: 100%;
        text-overflow: ellipsis;
    }

    .gd-button-icon {
        flex: 0 0 auto;
        width: ${buttonIconWidth};
        height: ${buttonIconWidth};
        margin: 0 0.5em;
        line-height: ${buttonIconWidth};
        color: ${getColor(type)};
        font-size: ${buttonIconWidth};
        text-align: center;
        text-decoration: none;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;

        &::before,
        &::after {
            color: inherit;
            ${transition("color", 0.25, "ease-in-out")}
        }
    }

    &:not(.gd-button-link) .gd-button-icon {
        &:first-child {
            margin-left: -4px;
        }

        &:last-child {
            margin-right: -4px;
        }

        &:only-child {
            width: 19px;
            height: 17px;
            line-height: 17px;
            margin-right: -9px;
            margin-left: -9px;
            font-size: 16px;
        }
    }

    &:not(.disabled):not(.gd-button-link) {
        &:active {
            &::before,
            &::after {
                top: calc(50% + 1px);
            }

            .gd-button-text {
                top: 2px;
            }

            .gd-button-icon {
                margin-top: 2px;
            }
        }

        .gd-button-icon {
            &:only-child {
                color: ${getColor(type)};
            }
        }
    }

    &:hover {
        &::before,
        &::after,
        .gd-button-icon {
            color: ${gdColorHighlight};
        }
    }

    &[class*="icon-"] {
        padding-left: 37px;

        &.icon-right {
            padding-left: 11px;
            padding-right: 32px;
        }
    }

    // former mixin end

    box-shadow: 0 1px 1px 0 ${boxShadowColor(type)}
    color: ${getColor(type)};
    background: ${getBackgroundColor(type)};
    // border-color: ${buttonNormalBorderColor};

    &:hover {
        box-shadow: 0 1px 1px 0 ${buttonShadowDarker}, inset 0 -1px 0 0 ${buttonNormalHoverBoxShadow};
        color: $gd-color-text;
        background: ${buttonNormalHoverBg};
        // border-color: ${buttonNormalHoverBorderColor};
    }

    &:focus,
    &.is-focus {
        box-shadow: 0 0 3px 1px ${buttonNormalFocusShadow}, 0 1px 2px 0 ${buttonShadowDarker},
            inset 0 -1px 0 0 ${buttonNormalHoverBoxShadow};
        border-color: ${transparentize(0.25, gdColorHighlight)};
    }

    &:active,
    &.is-active {
        box-shadow: inset 0 1px 0 0 ${buttonNormalActiveShadow};
        color: ${getColor(type)};
        border-color: ${buttonNormalActiveBorderColor};
        ${gradientLinear(buttonNormalActiveGradientTop, buttonNormalActiveGradientBottom)}
    }
    
    &[class*="icon-"],
    .gd-button-icon {
        color: ${getColor(type)};

        &,
        &:hover {
            &::before,
            &::after,
            .gd-button-icon {
                color: ${getColor(type)};
            }
        }
    }`;

/**
 * @internal
 */
export const Button = styled(BareButton)`
    ${(props) => getStyles(props)}
`;
