// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

export interface AddAKpiPlaceholderProps {
    disabled?: boolean;
}

export const AddKpiWidgetButton: React.FC<AddAKpiPlaceholderProps> = ({ disabled }) => {
    return (
        <div className={cx("add-item-placeholder", "add-kpi-placeholder", "s-add-kpi", { disabled })}>
            <FormattedMessage id="addPanel.kpi" />
        </div>
    );
};
