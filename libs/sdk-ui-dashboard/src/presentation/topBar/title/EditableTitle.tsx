// (C) 2021-2025 GoodData Corporation
import { EditableLabel } from "@gooddata/sdk-ui-kit";
import { defineMessage, useIntl } from "react-intl";

import { TitleWrapper } from "./TitleWrapper.js";
import { ITitleProps } from "./types.js";
import { DASHBOARD_TITLE_MAX_LENGTH } from "../../constants/index.js";
import { selectDashboardTitle, useDashboardSelector } from "../../../model/index.js";

const placeholderMessage = defineMessage({ id: "untitled" });

/**
 * @alpha
 */
export function EditableTitle(props: ITitleProps) {
    const { title, onTitleChanged } = props;
    const intl = useIntl();
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    return (
        <TitleWrapper>
            <EditableLabel
                value={title}
                onSubmit={onTitleChanged!}
                maxRows={1}
                maxLength={DASHBOARD_TITLE_MAX_LENGTH}
                className="s-gd-dashboard-title s-dash-title dash-title editable"
                isEditableLabelWidthBasedOnText={true}
                autofocus={!dashboardTitle}
                placeholder={intl.formatMessage(placeholderMessage)}
            >
                {title}
            </EditableLabel>
        </TitleWrapper>
    );
}
