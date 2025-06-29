// (C) 2025 GoodData Corporation

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
