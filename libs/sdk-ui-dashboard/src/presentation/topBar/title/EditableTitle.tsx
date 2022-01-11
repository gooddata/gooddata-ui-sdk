// (C) 2021-2022 GoodData Corporation
import React from "react";
import { EditableLabel } from "@gooddata/sdk-ui-kit";

import { TitleWrapper } from "./TitleWrapper";
import { CustomTitleComponent } from "./types";

/**
 * @alpha
 */
export const EditableTitle: CustomTitleComponent = (props) => {
    const { title, onTitleChanged } = props;
    return (
        <TitleWrapper>
            <EditableLabel
                value={title}
                onSubmit={onTitleChanged!}
                className="s-gd-dashboard-title s-dash-title dash-title editable"
            >
                {title}
            </EditableLabel>
        </TitleWrapper>
    );
};
