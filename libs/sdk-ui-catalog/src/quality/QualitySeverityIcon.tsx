// (C) 2025-2026 GoodData Corporation

import { useIntl } from "react-intl";

import type { SemanticQualityIssueSeverity } from "@gooddata/sdk-model";
import { type ThemeColor, UiIcon } from "@gooddata/sdk-ui-kit";

type Props = {
    severity: SemanticQualityIssueSeverity;
    size?: number;
    backgroundSize?: number;
    backgroundColor?: ThemeColor;
    /** Optional count of issues for this severity. Used for pluralized accessible label. */
    count?: number;
};

export function QualitySeverityIcon({ severity, count = 1, size, backgroundSize, backgroundColor }: Props) {
    const intl = useIntl();

    if (severity === "WARNING") {
        return (
            <UiIcon
                type="warning"
                color="warning"
                size={size}
                backgroundSize={backgroundSize}
                backgroundColor={backgroundColor}
                accessibilityConfig={{
                    ariaLabel: intl.formatMessage(
                        { id: "analyticsCatalog.quality.severity.warning" },
                        { count },
                    ),
                }}
            />
        );
    }
    return (
        <UiIcon
            type="recommendation"
            color="primary"
            size={size}
            backgroundSize={backgroundSize}
            backgroundColor={backgroundColor}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage(
                    { id: "analyticsCatalog.quality.severity.suggestion" },
                    { count },
                ),
            }}
        />
    );
}
