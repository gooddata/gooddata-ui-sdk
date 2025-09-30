// (C) 2025 GoodData Corporation

import { RefObject, useMemo, useRef } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiChip, UiListbox, UiPopover, UiTooltip } from "@gooddata/sdk-ui-kit";

import { KdaDateFilter } from "../../internalTypes.js";

interface IDateBarProps {
    date: KdaDateFilter;
    onPeriodChange: (filter: KdaDateFilter, period: "same_period_previous_year" | "previous_period") => void;
}

export function DateBar(props: IDateBarProps) {
    const intl = useIntl();
    const ref = useRef<HTMLUListElement>(null);

    const { title } = props.date;
    const label = intl.formatMessage(
        { id: "kdaDialog.dialog.bars.date.title" },
        {
            title,
        },
    );

    const items = useMemo(() => {
        return [
            {
                type: "interactive" as const,
                id: "same_period_previous_year",
                stringTitle: intl.formatMessage({
                    id: "kdaDialog.dialog.bars.date.period.samePeriodPreviousYear",
                }),
                data: "same_period_previous_year" as const,
            },
            {
                type: "interactive" as const,
                id: "previous_period",
                stringTitle: intl.formatMessage({ id: "kdaDialog.dialog.bars.date.period.previousPeriod" }),
                data: "previous_period" as const,
            },
        ];
    }, [intl]);

    return (
        <div className={cx("gd-kda-dialog-bar__date")}>
            <UiTooltip
                arrowPlacement="top-start"
                content={label}
                optimalPlacement
                triggerBy={["hover", "focus"]}
                anchor={
                    <UiPopover
                        anchor={<UiChip label={label} iconBefore="date" isExpandable={false} />}
                        title={intl.formatMessage({ id: "kdaDialog.dialog.bars.date.period.title" })}
                        initialFocus={ref as RefObject<HTMLElement>}
                        content={({ onClose }) => (
                            <div className={cx("gd-kda-dialog-bar__date-select")}>
                                <UiListbox
                                    reference={ref}
                                    selectedItemId={props.date.selectedPeriod}
                                    items={items}
                                    ariaAttributes={{
                                        id: "kda-dialog-date-bar",
                                    }}
                                    onClose={onClose}
                                    onSelect={(item) => {
                                        props.onPeriodChange(props.date, item.data);
                                    }}
                                />
                            </div>
                        )}
                    />
                }
            />
        </div>
    );
}
