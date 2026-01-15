// (C) 2025-2026 GoodData Corporation

import type { SemanticQualityIssueSeverity } from "@gooddata/sdk-model";
import { type ThemeColor, UiIcon } from "@gooddata/sdk-ui-kit";

type Props = {
    severity: SemanticQualityIssueSeverity;
    size?: number;
    backgroundSize?: number;
    backgroundColor?: ThemeColor;
};

export function QualitySeverityIcon({ severity, size, backgroundSize, backgroundColor }: Props) {
    if (severity === "WARNING") {
        return (
            <UiIcon
                type="warning"
                color="warning"
                size={size}
                backgroundSize={backgroundSize}
                backgroundColor={backgroundColor}
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
        />
    );
}
