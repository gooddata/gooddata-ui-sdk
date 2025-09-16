// (C) 2022-2025 GoodData Corporation

import { ReactNode, memo, useMemo } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { Overlay } from "./Overlay.js";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import { Typography } from "../Typography/index.js";

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

function ErrorOverlayCore({
    showIcon = true,
    showButton = true,
    icon,
    title,
    text,
    buttonTitle,
    onButtonClick,
    className,
    intl,
}: IErrorOverlayProps & WrappedComponentProps) {
    const theme = useTheme();

    const IconComponent = useMemo(() => {
        const LeaveIcon = Icon["Leave"];
        return icon ?? <LeaveIcon color={theme?.palette?.primary?.base} className="gd-error-overlay-icon" />;
    }, [icon, theme?.palette?.primary?.base]);
    const titleContent = useMemo(
        () => title ?? intl.formatMessage({ id: "error.overlay.title" }),
        [title, intl],
    );
    const textContent = useMemo(() => text ?? intl.formatMessage({ id: "error.overlay.text" }), [text, intl]);
    const buttonValue = useMemo(
        () => buttonTitle ?? intl.formatMessage({ id: "error.overlay.login" }),
        [buttonTitle, intl],
    );

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
                {showIcon ? IconComponent : null}
                <Typography tagName="h2">{titleContent}</Typography>
                <div className="gd-error-overlay-text">{textContent}</div>
                {showButton ? (
                    <Button
                        className="gd-button gd-button-action gd-error-overlay-button"
                        value={buttonValue}
                        onClick={onButtonClick}
                    />
                ) : null}
            </div>
        </Overlay>
    );
}

const ErrorOverlayWithIntl = injectIntl(ErrorOverlayCore);

/**
 * @internal
 */
export const ErrorOverlay = memo(function ErrorOverlay(props: IErrorOverlayProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <ErrorOverlayWithIntl {...props} />
        </IntlWrapper>
    );
});
