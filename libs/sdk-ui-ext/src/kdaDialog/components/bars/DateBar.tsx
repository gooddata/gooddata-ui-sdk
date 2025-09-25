// (C) 2025 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiChip, UiTooltip } from "@gooddata/sdk-ui-kit";

import { KdaDateFilter } from "../../internalTypes.js";

interface IDateBarProps {
    date: KdaDateFilter;
}

export function DateBar(props: IDateBarProps) {
    const intl = useIntl();

    const { title } = props.date;
    const label = intl.formatMessage(
        { id: "kdaDialog.dialog.bars.date.title" },
        {
            title,
        },
    );

    return (
        <div className={cx("gd-kda-dialog-bar__date")}>
            <UiTooltip
                arrowPlacement="top-start"
                content={label}
                optimalPlacement
                triggerBy={["hover", "focus"]}
                anchor={<UiChip label={label} iconBefore="date" isExpandable={false} />}
            />
        </div>
    );
}
