// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

export const DefaultEmptyLayoutDropZoneBody: React.FC = () => {
    return (
        <div className="drag-info-placeholder-box s-drag-info-placeholder-box">
            <Typography tagName="h2">
                <FormattedMessage id="newDashboard.title" />
            </Typography>
        </div>
    );
};
