// (C) 2022-2025 GoodData Corporation
import { FormattedMessage } from "react-intl";
import cx from "classnames";

export interface AddAKpiPlaceholderProps {
    disabled?: boolean;
}

export function AddKpiWidgetButton({ disabled }: AddAKpiPlaceholderProps) {
    return (
        <div className={cx("add-item-placeholder", "add-kpi-placeholder", "s-add-kpi", { disabled })}>
            <FormattedMessage id="addPanel.kpi" />
        </div>
    );
}
