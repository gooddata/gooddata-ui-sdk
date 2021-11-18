// (C) 2021 GoodData Corporation
import React from "react";
import { EditableLabel } from "@gooddata/sdk-ui-kit";
import { ITitleProps } from "./types";

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
 * @alpha
 */
export const DefaultTitle = (props: ITitleProps): JSX.Element | null => {
    const { title, onTitleChanged } = props;

    return (
        <div className="dash-title-wrapper">
            {onTitleChanged ? (
                <EditableTitle title={title} onTitleChanged={onTitleChanged} />
            ) : (
                <div className={"s-gd-dashboard-title dash-title static"}>{title}</div>
            )}
        </div>
    );
};
