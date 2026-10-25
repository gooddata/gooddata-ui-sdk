// (C) 2019-2026 GoodData Corporation

import classNames from "classnames";
import { type IntlShape } from "react-intl";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useIsEvenAnimation } from "./AnimationHook.js";

export interface IFilterBarButtonProps {
    isActive: boolean;
    onClick: () => void;
    animationTimestamp?: number;
    refCallback: (buttonNodeRef: HTMLElement) => void;
    intl: IntlShape;
}

function FilterButton({ isActive, onClick, animationTimestamp, refCallback, intl }: IFilterBarButtonProps) {
    const isFirstRender = !!animationTimestamp;
    const isEvenAnimation = useIsEvenAnimation(animationTimestamp);
    const buttonLabel = intl.formatMessage({ id: "filter_bar_add_filter.tooltip" });
    return (
        <div
            className={classNames({
                "adi-filter-bar-button-highlight--even": isFirstRender && isEvenAnimation,
                "adi-filter-bar-button-highlight--odd": isFirstRender && !isEvenAnimation,
            })}
        >
            <div className="adi-filter-bar-button-highlight" />
            <div
                className={classNames("adi-filter-bar-button", "s-filter-bar-button", {
                    "is-active": isActive,
                })}
            >
                <UiIconButton
                    icon="plus"
                    label={buttonLabel}
                    size="medium"
                    variant="secondary"
                    onClick={onClick}
                    ref={(button) => (button ? refCallback(button) : null)}
                    isActive={isActive}
                    isDisabled={false}
                    dataTestId="s-filter-bar-button"
                />
            </div>
        </div>
    );
}

export function FilterBarButton(props: IFilterBarButtonProps) {
    const { intl } = props;
    const tooltipContent = intl.formatMessage({ id: "filter_bar_add_filter.tooltip" });
    return (
        <UiTooltip
            content={tooltipContent}
            triggerBy={["hover", "focus"]}
            anchor={<FilterButton {...props} />}
            accessibilityConfig={{ ariaLabel: tooltipContent }}
        />
    );
}
