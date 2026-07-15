// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { useIdPrefixed } from "../../utils/useId.js";
import { bem } from "../@utils/bem.js";
import { UiDate } from "../UiDate/UiDate.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

import { type IUiCertificationIconProps } from "./types.js";

const { b, e } = bem("gd-ui-kit-certification-icon");

/**
 * @internal
 */
export function UiCertificationIcon({
    certification,
    size,
    tabIndex = 0,
    accessibilityConfig,
}: IUiCertificationIconProps) {
    const intl = useIntl();
    const tooltipId = useIdPrefixed("certification-tooltip");

    const certificationAriaLabel =
        accessibilityConfig?.ariaLabel ?? intl.formatMessage({ id: "uiKit.certification.tooltip.title" });

    const icon = (
        <span tabIndex={tabIndex} aria-label={certificationAriaLabel} aria-describedby={tooltipId}>
            <UiIcon
                type="certification"
                size={size ?? 16}
                backgroundSize={26}
                color="success"
                layout="block"
                accessibilityConfig={{ ariaHidden: true }}
            />
        </span>
    );

    return (
        <div className={b()}>
            <UiTooltip
                id={tooltipId}
                arrowPlacement="top"
                optimalPlacement
                triggerBy={["hover", "focus"]}
                variant="none"
                showArrow={false}
                width={200}
                offset={-6}
                anchor={icon}
                content={
                    <div className={e("tooltip")}>
                        <div className={e("tooltip-header")}>
                            <UiIcon type="certification" size={14} color="success" layout="block" />
                            <span className={e("tooltip-title")}>
                                {intl.formatMessage({ id: "uiKit.certification.tooltip.title" })}
                            </span>
                        </div>
                        {certification.message ? (
                            <div className={e("tooltip-message")}>{certification.message}</div>
                        ) : null}
                        {certification.certifiedBy ? (
                            <>
                                <div className={e("tooltip-date")}>
                                    {intl.formatMessage({ id: "uiKit.certification.tooltip.certifiedBy" })}
                                </div>
                                <div className={e("tooltip-date-value")}>{certification.certifiedBy}</div>
                            </>
                        ) : null}
                        {certification.certifiedAt ? (
                            <>
                                <div className={e("tooltip-date")}>
                                    {intl.formatMessage({ id: "uiKit.certification.tooltip.certifiedAt" })}
                                </div>
                                <div className={e("tooltip-date-value")}>
                                    <UiDate
                                        date={certification.certifiedAt}
                                        locale={intl.locale}
                                        allowRelative={false}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                }
            />
        </div>
    );
}
