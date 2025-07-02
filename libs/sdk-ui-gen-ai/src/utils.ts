// (C) 2025 GoodData Corporation

import { IAttributeOrMeasure } from "@gooddata/sdk-model";

export function getVisualizationHref(wsId: string, visId: string) {
    return `/analyze/#/${wsId}/${visId}/edit`;
}

export function getAbsoluteVisualizationHref(wsId: string, visId: string) {
    return `${window.location.origin}${getVisualizationHref(wsId, visId)}`;
}

export function getSettingHref(section: string, action: string) {
    return `/settings/#/${section}/${action}`;
}

export function getAbsoluteSettingHref(section: string, action: string) {
    return `${window.location.origin}${getSettingHref(section, action)}`;
}

export function getHeadlineComparison(metrics: IAttributeOrMeasure[]) {
    return {
        comparison: {
            enabled: metrics.filter(Boolean).length > 1,
        },
    };
}
