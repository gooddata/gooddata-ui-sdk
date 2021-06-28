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
     * Callback that the component calls when title edit enabled the title is changed. If no set,
     * the title is considered non-editable
     */
    onTitleChanged?: (title: string) => void;
}

const DashboardEditableTitle: React.FC<{
    title: string;
    onTitleChanged: (title: string) => void;
}> = (props) => {
    const { title, onTitleChanged } = props;
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

/**
 * @internal
 */
export const DashboardTitleCore: React.FC<IDashboardTitleProps> = (props: IDashboardTitleProps) => {
    const { title, onTitleChanged } = props;

    return onTitleChanged ? (
        <DashboardEditableTitle title={title} onTitleChanged={onTitleChanged} />
    ) : (
        <div className={"s-gd-dashboard-title dash-title static"}>{title}</div>
    );
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
    placement: "left" as Placement,
};
