// (C) 2022 GoodData Corporation

import React, { ReactNode } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Typography } from "../Typography";
import { Overlay } from "./Overlay";
import { IntlWrapper } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export interface IErrorOverlayProps {
    showButton?: boolean;
    showIcon?: boolean;
    icon?: ReactNode;
    title?: ReactNode;
    text?: ReactNode;
    buttonTitle?: string;
    onButtonClick?: () => void;
    className?: string;
    locale?: string;
}

const ErrorOverlayCore: React.VFC<IErrorOverlayProps & WrappedComponentProps> = (props) => {
    const {
        showIcon = true,
        showButton = true,
        icon,
        title,
        text,
        buttonTitle,
        onButtonClick,
        className,
        intl,
    } = props;

    const theme = useTheme();

    const IconComponent = icon ?? (
        <Icon.Leave color={theme?.palette?.primary?.base} className="gd-error-overlay-icon" />
    );
    const titleContent = title ?? intl.formatMessage({ id: "error.overlay.title" });
    const textContent = text ?? intl.formatMessage({ id: "error.overlay.text" });
    const buttonValue = buttonTitle ?? intl.formatMessage({ id: "error.overlay.login" });

    return (
        <Overlay
            isModal={true}
            positionType="fixed"
            alignPoints={[{ align: "cc cc" }]}
            closeOnEscape={false}
            closeOnParentScroll={false}
            closeOnOutsideClick={false}
            closeOnMouseDrag={false}
            zIndex={10001}
            containerClassName="gd-error-overlay-content"
            className={className}
        >
            <div className="gd-error-overlay s-error-overlay">
                {showIcon && IconComponent}
                <Typography tagName="h2">{titleContent}</Typography>
                <div className="gd-error-overlay-text">{textContent}</div>
                {showButton && (
                    <Button
                        className="gd-button gd-button-action gd-error-overlay-button"
                        value={buttonValue}
                        onClick={onButtonClick}
                    />
                )}
            </div>
        </Overlay>
    );
};

const ErrorOverlayWithIntl = injectIntl(ErrorOverlayCore);

/**
 * @internal
 */
export class ErrorOverlay extends React.PureComponent<IErrorOverlayProps> {
    public render(): React.ReactNode {
        return (
            <IntlWrapper locale={this.props.locale}>
                <ErrorOverlayWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
