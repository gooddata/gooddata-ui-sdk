// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import noop from "lodash/noop.js";
import { IButtonProps } from "./typings.js";

const getGeneratedTestId = (effectiveValue: React.ReactNode, title: string, ariaLabel: string) => {
    if (effectiveValue && typeof effectiveValue === "string") {
        return `${stringUtils.simplifyText(effectiveValue)}`;
    }
    return ariaLabel ? `${stringUtils.simplifyText(ariaLabel)}` : `${stringUtils.simplifyText(title)}`;
};

const Icon: React.FC<{ icon: string | undefined }> = ({ icon }) => {
    if (!icon) {
        return null;
    }

    return <span className={cx("gd-button-icon", icon)} data-testid="gd-button-icon" aria-hidden="true" />;
};

/**
 * @internal
 */
export const Button = React.forwardRef<HTMLElement, IButtonProps>(function Button(
    {
        className,
        disabled = false,
        onClick = noop,
        tabIndex = 0,
        tagName = "button",
        type = "button",
        id,
        title,
        iconLeft,
        iconRight,
        accessibilityConfig,
        dataId,
        dataTestId,
        intent,
        size,
        variant,
        value,
        children,
    },
    ref,
) {
    const {
        isExpanded,
        popupId,
        ariaLabel,
        ariaLabelledBy,
        ariaDescribedBy,
        role = "button",
    } = accessibilityConfig ?? {};

    const ariaDropdownProps = {
        ...(popupId && isExpanded ? { "aria-controls": popupId } : {}),
        ...(popupId ? { "aria-haspopup": !!popupId } : {}),
        ...(isExpanded !== undefined ? { "aria-expanded": isExpanded } : {}),
    };

    const handleClick = React.useCallback<React.MouseEventHandler>(
        (e) => {
            if (disabled) {
                return;
            }
            onClick(e);
        },
        [disabled, onClick],
    );

    const effectiveValue = React.useMemo(() => value ?? children, [children, value]);
    const testId = dataTestId ? dataTestId : getGeneratedTestId(effectiveValue, title, ariaLabel);

    const classNames = React.useMemo(() => {
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
    }, [className, disabled, effectiveValue, intent, size, variant]);

    const TagName = tagName as any;
    return (
        <TagName
            id={id}
            data-id={dataId}
            data-testid={testId}
            ref={ref}
            title={title}
            className={classNames}
            type={type}
            onClick={handleClick}
            tabIndex={tabIndex}
            aria-disabled={disabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            {...ariaDropdownProps}
            role={role}
        >
            <Icon icon={iconLeft} />

            {effectiveValue ? <span className="gd-button-text">{effectiveValue}</span> : null}

            <Icon icon={iconRight} />
        </TagName>
    );
});
