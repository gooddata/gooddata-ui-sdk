// (C) 2019-2026 GoodData Corporation

import { type ReactNode, memo } from "react";

import { useIntl } from "react-intl";

import { getTranslation } from "../../../utils/translations.js";

export interface IAnomalyIndicatorControl {
    title: string | undefined;
    children: ReactNode;
}

export const AnomalyIndicatorControl = memo(function AnomalyColorControl(props: IAnomalyIndicatorControl) {
    const intl = useIntl();

    return (
        <div className="configuration-subsection s-configuration-subsection-anomaly-detection">
            <fieldset className="gd-anomalies-section-control">
                <legend className="legend-title">{getTranslation(props.title, intl)}</legend>
                <div className="gd-anomalies-section-content">{props.children}</div>
            </fieldset>
        </div>
    );
});
