// (C) 2022-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

export interface IAddAKpiPlaceholderProps {
    disabled?: boolean;
}

export function AddKpiWidgetButton({ disabled }: IAddAKpiPlaceholderProps) {
    return (
        <div className={cx("add-item-placeholder", "add-kpi-placeholder", "s-add-kpi", { disabled })}>
            <FormattedMessage id="addPanel.kpi" />
        </div>
    );
}
