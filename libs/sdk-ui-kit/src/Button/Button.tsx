// (C) 2007-2025 GoodData Corporation

import { MouseEventHandler, ReactNode, forwardRef, useCallback, useMemo } from "react";

import cx from "classnames";

import { ValidationContextStore } from "@gooddata/sdk-ui";
import { stringUtils } from "@gooddata/util";

import { IButtonProps } from "./typings.js";

const getGeneratedTestId = (effectiveValue: ReactNode, title: string, ariaLabel: string) => {
    if (effectiveValue && typeof effectiveValue === "string") {
        return `${stringUtils.simplifyText(effectiveValue)}`;
    }
    return ariaLabel ? `${stringUtils.simplifyText(ariaLabel)}` : `${stringUtils.simplifyText(title)}`;
};

function Icon({ icon }: { icon: string | undefined }) {
    if (!icon) {
        return null;
    }

    return <span className={cx("gd-button-icon", icon)} data-testid="gd-button-icon" aria-hidden="true" />;
}

/**
 * @internal
 */
export const Button = forwardRef<HTMLElement, IButtonProps>(function Button(
    {
        className,
        describedByFromValidation: isDescribedByFromValidation = false,
        disabled = false,
        onClick = () => {},
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
        ariaDescribedBy: ariaDescribedByFromConfig,
        popupType,
        ariaHaspopup,
        role = "button",
        ariaControls,
        ariaExpanded,
    } = accessibilityConfig ?? {};

    const ariaDropdownProps = {
        ...(popupId && isExpanded ? { "aria-controls": popupId } : {}),
        ...(ariaHaspopup ? { "aria-haspopup": ariaHaspopup } : {}),
        ...(popupId ? { "aria-haspopup": popupType ?? !!popupId } : {}),
        ...(isExpanded === undefined ? {} : { "aria-expanded": isExpanded }),
    };

    const ariaDropdownAttributesFromConfig = {
        ...ariaDropdownProps,
        // override calculated dropdown props by explicit overrides from props
        "aria-controls": ariaControls ?? undefined,
        "aria-expanded": ariaExpanded ?? undefined,
    };

    const handleClick = useCallback<MouseEventHandler>(
        (e) => {
            if (disabled) {
                return;
            }
            onClick(e);
        },
        [disabled, onClick],
    );

    const describedByFromValidation = ValidationContextStore.useContextStoreOptional((ctx) =>
        ctx
            .getInvalidDatapoints({ recursive: true })
            .map((datapoint) => datapoint.id)
            .join(" "),
    );

    const ariaDescribedBy = isDescribedByFromValidation
        ? [describedByFromValidation, ariaDescribedByFromConfig].filter(Boolean).join(" ") || undefined
        : ariaDescribedByFromConfig;

    const effectiveValue = useMemo(() => value ?? children, [children, value]);
    const testId = dataTestId || getGeneratedTestId(effectiveValue, title ?? "", ariaLabel ?? "");

    const classNames = useMemo(() => {
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
            aria-disabled={disabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            {...ariaDropdownAttributesFromConfig}
            {...(tagName === "button" ? {} : { tabIndex })}
            {...(tagName !== "button" || role !== "button" ? { role } : {})}
        >
            <Icon icon={iconLeft} />

            {effectiveValue ? <span className="gd-button-text">{effectiveValue}</span> : null}

            <Icon icon={iconRight} />
        </TagName>
    );
});
