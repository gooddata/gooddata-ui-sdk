// (C) 2025 GoodData Corporation

import { RefObject, useMemo, useRef } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiChip, UiListbox, UiPopover, UiTooltip } from "@gooddata/sdk-ui-kit";

import { KdaDateOptions } from "../../internalTypes.js";
import { KdaPeriodType } from "../../types.js";
import { formatTitle } from "../../utils.js";

interface IDateBarProps {
    options: KdaDateOptions;
    isAvailable: boolean;
    onPeriodChange: (period: KdaPeriodType) => void;
}

export function DateBar(props: IDateBarProps) {
    const intl = useIntl();
    const ref = useRef<HTMLUListElement>(null);

    const splitter = intl.formatMessage({ id: "kdaDialog.dialog.bars.date.splitter" });
    const label = intl.formatMessage(
        { id: "kdaDialog.dialog.bars.date.title" },
        {
            title: formatTitle(props.options, splitter),
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
                        disabled={!props.isAvailable}
                        anchor={<UiChip label={label} iconBefore="date" isExpandable={false} />}
                        title={intl.formatMessage({ id: "kdaDialog.dialog.bars.date.period.title" })}
                        initialFocus={ref as RefObject<HTMLElement>}
                        content={({ onClose }) => (
                            <div className={cx("gd-kda-dialog-bar__date-select")}>
                                <UiListbox
                                    reference={ref}
                                    selectedItemId={props.options.period}
                                    items={items}
                                    ariaAttributes={{
                                        id: "kda-dialog-date-bar",
                                    }}
                                    onClose={onClose}
                                    onSelect={(item) => {
                                        props.onPeriodChange(item.data);
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
