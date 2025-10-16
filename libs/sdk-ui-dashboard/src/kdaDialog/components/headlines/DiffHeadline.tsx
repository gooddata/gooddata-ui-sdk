// (C) 2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

export interface DiffHeadlineProps {
    amount: string;
    change: number;
}

export function DiffHeadline({ change, amount }: DiffHeadlineProps) {
    return (
        <div className={cx("gd-kda-headline-diff")}>
            {change > 0 ? (
                <UiIcon type="trendUp" size={14} color="complementary-5" />
            ) : (
                <UiIcon type="trendDown" size={14} color="complementary-5" />
            )}
            <div>
                <FormattedMessage id="kdaDialog.dialog.keyDrives.overview.diff.title" />
            </div>
            <div>
                <strong>
                    {amount} ({Math.round(change * 10000) / 100}%)
                </strong>
            </div>
        </div>
    );
}
