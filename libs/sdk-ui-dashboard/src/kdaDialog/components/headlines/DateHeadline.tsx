// (C) 2025 GoodData Corporation

import cx from "classnames";

import { UiIcon } from "@gooddata/sdk-ui-kit";

export interface DateHeadlineProps {
    when: string;
    amount: string;
}

export function DateHeadline({ when, amount }: DateHeadlineProps) {
    return (
        <div className={cx("gd-kda-headline-date")}>
            <UiIcon type="date" size={14} color="primary" />
            <div>{when}</div>
            <div>
                <strong>{amount}</strong>
            </div>
        </div>
    );
}
