// (C) 2026 GoodData Corporation

import { type ReactElement, useState } from "react";

import { type IntlShape, useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { changeDashboardDensity } from "../../model/commands/density.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { uiActions } from "../../model/store/ui/index.js";
import { selectDashboardDensity } from "../../model/store/ui/uiSelectors.js";
import { type DashboardDensity } from "../../types.js";

const getDensityOptionLabel = (
    intl: IntlShape,
    density: DashboardDensity,
    defaultDensity: DashboardDensity,
) => {
    const standardLabel = intl.formatMessage({ id: "density.dialog.option.standard" });
    const compactLabel = intl.formatMessage({ id: "density.dialog.option.compact" });
    const label = density === "comfortable" ? standardLabel : compactLabel;
    return defaultDensity === density
        ? intl.formatMessage({ id: "density.dialog.option.default" }, { value: label })
        : label;
};

/**
 * @alpha
 */
export function DensityDialog(): ReactElement | null {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();
    const currentDensity = useDashboardSelector(selectDashboardDensity);
    const theme = useTheme();
    const defaultDensity = theme?.dashboards?.density ?? "comfortable";
    const [selected, setSelected] = useState<DashboardDensity>(currentDensity);

    const onCancel = () => dispatch(uiActions.closeDensityDialog());

    const onApply = () => {
        dispatch(uiActions.closeDensityDialog());
        if (selected !== currentDensity) {
            dispatch(changeDashboardDensity(selected));
        }
    };

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onSubmit={onApply}
            isPositive
            className="s-dialog s-density-dialog gd-density-dialog"
            headline={intl.formatMessage({ id: "density.dialog.title" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "apply" })}
        >
            <div className="gd-density-dialog-description">
                {intl.formatMessage({ id: "density.dialog.description" })}
            </div>
            <div className="gd-density-dialog-options">
                <div className="gd-density-dialog-option">
                    <label className="input-radio-label">
                        <input
                            type="radio"
                            name="density"
                            value="comfortable"
                            checked={selected === "comfortable"}
                            onChange={() => setSelected("comfortable")}
                            className="input-radio"
                        />
                        <span className="gd-density-dialog-option-title input-label-text">
                            {getDensityOptionLabel(intl, "comfortable", defaultDensity)}
                        </span>
                    </label>
                    <div className="gd-density-dialog-option-description">
                        {intl.formatMessage({ id: "density.dialog.option.standard.description" })}
                    </div>
                </div>
                <div className="gd-density-dialog-option">
                    <label className="input-radio-label">
                        <input
                            type="radio"
                            name="density"
                            value="compact"
                            checked={selected === "compact"}
                            onChange={() => setSelected("compact")}
                            className="input-radio"
                        />
                        <span className="gd-density-dialog-option-title input-label-text">
                            {getDensityOptionLabel(intl, "compact", defaultDensity)}
                        </span>
                    </label>
                    <div className="gd-density-dialog-option-description">
                        {intl.formatMessage({ id: "density.dialog.option.compact.description" })}
                    </div>
                </div>
            </div>
        </ConfirmDialog>
    );
}
