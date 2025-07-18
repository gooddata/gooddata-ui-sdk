// (C) 2022-2025 GoodData Corporation
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

export function DefaultEmptyLayoutDropZoneBody() {
    return (
        <div className="drag-info-placeholder-box s-drag-info-placeholder-box">
            <Typography tagName="h2">
                <FormattedMessage id="newDashboard.title" />
            </Typography>
        </div>
    );
}
