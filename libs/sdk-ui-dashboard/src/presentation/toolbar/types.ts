// (C) 2022 GoodData Corporation

/**
 * @internal
 */
export interface IDashboardToolbarButton {
    icon: string;
    id: string;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    tooltip?: string;
}

/**
 * @internal
 */
export interface IDashboardToolbarGroup {
    title: string;
    buttons: IDashboardToolbarButton[];
}
