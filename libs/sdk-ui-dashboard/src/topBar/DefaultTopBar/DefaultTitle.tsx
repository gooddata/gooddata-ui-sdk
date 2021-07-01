// (C) 2021 GoodData Corporation
import React from "react";
import { EditableLabel } from "@gooddata/sdk-ui-kit";

import { IDefaultTitleProps } from "../types";

const EditableTitle: React.FC<{
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
 *
 * TODO Consider placement property.
 */
export const DefaultTitle: React.FC<IDefaultTitleProps> = (props) => {
    const { title, onTitleChanged } = props;

    return onTitleChanged ? (
        <EditableTitle title={title} onTitleChanged={onTitleChanged} />
    ) : (
        <div className={"s-gd-dashboard-title dash-title static"}>{title}</div>
    );
};
