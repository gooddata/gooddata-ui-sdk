// (C) 2026 GoodData Corporation

import { type ComponentProps, memo } from "react";

import type { IntlShape } from "react-intl";

import { UiDate, UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useIsCatalogCertificationEnabled } from "./gate.js";
import { type ICatalogItem } from "../catalogItem/types.js";

type CertificationIconProps = ComponentProps<"div"> & {
    intl: IntlShape;
    certification?: ICatalogItem["certification"];
};

export const CertificationIconMemo = memo(function CertificationIcon(props: CertificationIconProps) {
    const { certification, intl, ...htmlProps } = props;
    const isCertificationEnabled = useIsCatalogCertificationEnabled();

    if (!isCertificationEnabled || certification?.status !== "CERTIFIED") {
        return null;
    }

    return (
        <div {...htmlProps}>
            <UiTooltip
                arrowPlacement="top"
                optimalPlacement
                triggerBy={["hover", "focus"]}
                variant="none"
                showArrow={false}
                width={200}
                offset={-6}
                anchor={
                    <UiIcon
                        type="certification"
                        size={14}
                        backgroundSize={26}
                        color="success"
                        layout="block"
                    />
                }
                content={
                    <div className="gd-analytics-catalog__certification-tooltip">
                        <div className="gd-analytics-catalog__certification-tooltip__header">
                            <UiIcon type="certification" size={14} color="success" layout="block" />
                            <span className="gd-analytics-catalog__certification-tooltip__title">
                                {intl.formatMessage({
                                    id: "analyticsCatalog.certification.tooltip.title",
                                })}
                            </span>
                        </div>
                        {certification.message ? (
                            <div className="gd-analytics-catalog__certification-tooltip__message">
                                {certification.message}
                            </div>
                        ) : null}
                        {certification.certifiedBy ? (
                            <>
                                <div className="gd-analytics-catalog__certification-tooltip__date">
                                    {intl.formatMessage({
                                        id: "analyticsCatalog.certification.tooltip.certifiedBy",
                                    })}
                                </div>
                                <div className="gd-analytics-catalog__certification-tooltip__date_value">
                                    {certification.certifiedBy}
                                </div>
                            </>
                        ) : null}
                        {certification.certifiedAt ? (
                            <>
                                <div className="gd-analytics-catalog__certification-tooltip__date">
                                    {intl.formatMessage({
                                        id: "analyticsCatalog.certification.tooltip.certifiedAt",
                                    })}
                                </div>
                                <div className="gd-analytics-catalog__certification-tooltip__date_value">
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
});
