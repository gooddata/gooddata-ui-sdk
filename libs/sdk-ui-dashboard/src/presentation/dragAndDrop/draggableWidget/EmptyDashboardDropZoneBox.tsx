// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

export const EmptyDashboardDropZoneBox: React.FC = () => {
    return (
        <div className="drag-info-placeholder-box s-drag-info-placeholder-box">
            <Typography tagName="h2">
                <FormattedMessage id="newDashboard.title" />
            </Typography>
            {/*<Typography tagName="p">
                <FormattedMessage id="newDashboard.subtitle" />
            </Typography>
             <div className="drag-info-placeholder-box-insight">
                <Typography tagName="p">
                    <span className="gd-icon-insight" />
                    <FormattedMessage id="newDashboard.subtitle.insight" />
                </Typography>
            </div> */}
        </div>
    );
};
