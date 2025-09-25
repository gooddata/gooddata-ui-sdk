// (C) 2025 GoodData Corporation

import cx from "classnames";

import { UiIcon } from "@gooddata/sdk-ui-kit";

export interface DiffHeadlineProps {
    amount: string;
    change: number;
}

export function DiffHeadline({ change, amount }: DiffHeadlineProps) {
    return (
        <div className={cx("gd-kda-headline-diff")}>
            <UiIcon type="trendDown" size={14} color="complementary-5" />
            <div>Diff</div>
            <div>
                <strong>
                    {amount} ({change * 100}%)
                </strong>
            </div>
        </div>
    );
}
