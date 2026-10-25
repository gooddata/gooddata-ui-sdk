// (C) 2026 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

export function DisableableFilterWrapper(props: {
    children: ReactNode;
    isDisabled: boolean;
    className?: string;
}) {
    const { isDisabled, className, children } = props;

    const disabledTooltip = useIntl().formatMessage({ id: "filter.date.disabled_for_empty_values_only" });

    const content = useMemo(() => {
        return (
            <div aria-hidden={isDisabled} className={cx(className, { "is-disabled": isDisabled })}>
                {children}
            </div>
        );
    }, [children, className, isDisabled]);

    if (isDisabled) {
        return (
            <UiTooltip
                anchorWrapperStyles={{ width: "100%" }}
                anchor={content}
                content={disabledTooltip}
                arrowPlacement="left"
                triggerBy={["hover"]}
                optimalPlacement
            />
        );
    }

    return content;
}
