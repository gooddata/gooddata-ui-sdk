// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";

/**
 * @internal
 */
export interface IDashboardTitleProps {
    /**
     * Dashboard title to render
     */
    title: string;

    /**
     * Callback that the component MUST call when the title is clicked.
     */
    onTitleClicked: () => void;
}

/**
 * @internal
 */
export const DashboardTitle: React.FC<IDashboardTitleProps> = (_props: IDashboardTitleProps) => {
    return null;
};

/**
 * @internal
 */
export type DashboardTitleComponent = ComponentType<IDashboardTitleProps>;
