// (C) 2007-2025 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

/**
 * Props for the AttributeFilterElementsSelectItemTooltip component
 * @beta
 */
export interface IAttributeFilterElementsSelectItemTooltipProps {
    primaryLabelTitle?: string;
    itemPrimaryTitle?: string;
    isFocused?: boolean;
    id?: string;
    renderAsCell?: boolean;
    ariaLabel?: string;
}

export function AttributeFilterElementsSelectItemTooltip({
    primaryLabelTitle,
    itemPrimaryTitle,
    id,
    isFocused = false,
    renderAsCell = true,
    ariaLabel,
}: IAttributeFilterElementsSelectItemTooltipProps) {
    const { formatMessage } = useIntl();

    if (!primaryLabelTitle || !itemPrimaryTitle) {
        return null;
    }

    return (
        <div role={renderAsCell ? "gridcell" : "div"}>
            <UiTooltip
                hoverOpenDelay={0}
                hoverCloseDelay={0}
                arrowPlacement={"left"}
                optimalPlacement
                offset={15}
                isOpen={isFocused ? true : undefined}
                triggerBy={["focus", "hover"]}
                anchor={
                    <div
                        className={cx("gd-list-item-only gd-item-title-tooltip-wrapper", {
                            "gd-list-item-only--isFocusedSelectItem": isFocused,
                        })}
                        id={id}
                        tabIndex={isFocused ? 0 : -1}
                        role={"button"}
                        aria-label={
                            ariaLabel ??
                            formatMessage(
                                { id: "attributesDropdown.alternativeValueTooltip" },
                                { label: primaryLabelTitle, value: itemPrimaryTitle },
                            )
                        }
                    >
                        <UiIcon
                            color="currentColor"
                            layout={"block"}
                            size={13}
                            type={"question"}
                            ariaHidden
                        />
                    </div>
                }
                content={
                    <div className={"gd-item-title-tooltip"}>
                        <h4>{primaryLabelTitle}</h4>
                        <p>{itemPrimaryTitle}</p>
                    </div>
                }
            />
        </div>
    );
}
