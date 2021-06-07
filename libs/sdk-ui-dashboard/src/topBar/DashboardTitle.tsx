// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";
import { Placement } from "../model/types/topBarTypes";
import { EditableLabel } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface IDashboardTitleProps {
    /**
     * Dashboard title to render
     */
    title: string;

    /**
     * Callback that the component calls when title edit enabled the title is changed. If not set, title
     * taken as non-editable.
     */
    onTitleChanged?: (title: string) => void;

    /**
     * Indicates if title edit is enabled.
     */
    isEditEnabled?: boolean;
}

/**
 * @internal
 */
export const DashboardTitleCore: React.FC<IDashboardTitleProps> = (props: IDashboardTitleProps) => {
    const { title, isEditEnabled, onTitleChanged } = props;

    const renderEditableTitle = () => {
        // if onTitleChanged callback not set, dashboard is not editable.
        if (!isEditEnabled || !onTitleChanged) {
            return null;
        }

        return (
            <EditableLabel
                value={title}
                onSubmit={onTitleChanged}
                className={"s-gd-dashboard-title dash-title editable"}
            >
                {title}
            </EditableLabel>
        );
    };

    const renderStaticTitle = () => {
        return <div className={"s-gd-dashboard-title dash-title static"}>{title}</div>;
    };

    return isEditEnabled ? renderEditableTitle() : renderStaticTitle();
};

/**
 * @internal
 *
 * TODO Consider placement property.
 */
export const DashboardTitle: React.FC<IDashboardTitleProps> = (props: IDashboardTitleProps) => {
    return <DashboardTitleCore {...props} />;
};

/**
 * @internal
 */
export type DashboardTitleComponent = ComponentType<IDashboardTitleProps>;

export const defaultTitleComponentProps = {
    Component: DashboardTitle,
    placement: "right" as Placement,
};
