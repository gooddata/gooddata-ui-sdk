// (C) 2022-2025 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { Button, Dropdown, DropdownButton, IAlignPoint, NoData } from "@gooddata/sdk-ui-kit";
import { IKpiWidget, widgetRef } from "@gooddata/sdk-model";
import {
    removeDrillForKpiWidget,
    selectShouldHidePixelPerfectExperience,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";

const alignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];

interface IKpiDrillConfigurationProps {
    widget: IKpiWidget;
}

interface IDrillToDropdownButtonProps {
    selection: any;
    title: string;
    value: string;
    isOpen?: boolean;
    isDisabled?: boolean;
    onClick?: () => void;
}

const DrillToDropdownButton: React.FC<IDrillToDropdownButtonProps> = (props) => {
    const { isDisabled = false, isOpen = false, value = "", selection, title = "", onClick } = props;
    let button;

    if (selection) {
        button = <DropdownButton title={title} value={value} onClick={onClick} isOpen={isOpen} />;
    } else {
        const buttonClasses = cx("gd-button-secondary", "gd-button-small", "gd-icon-add", {
            "is-focus": isOpen,
        });

        button = (
            <Button
                onClick={onClick}
                title={title}
                className={buttonClasses}
                value={value}
                disabled={isDisabled}
            />
        );
    }

    return <div className="s-drill_to_select">{button}</div>;
};

const KpiDrillConfigurationCore: React.FC<IKpiDrillConfigurationProps> = (props) => {
    const { widget } = props;

    const intl = useIntl();

    const dispatch = useDashboardDispatch();

    const onDrillToRemove = useCallback(() => {
        dispatch(removeDrillForKpiWidget(widgetRef(widget)));
    }, [dispatch, widget]);

    const drillToItem = widget.drills?.[0]?.tab;

    const UNLISTED_DASHBOARD_TAB = {
        title: intl.formatMessage({ id: "configurationPanel.unlistedDashboardTab" }),
    };

    const foundDrillToItem = false;

    const selectedDrillToItem = drillToItem ? foundDrillToItem || UNLISTED_DASHBOARD_TAB : null;
    const buttonValue = selectedDrillToItem
        ? selectedDrillToItem.title
        : intl.formatMessage({ id: "configurationPanel.selectDashboard" });

    return (
        <div className="drill-to-dropdown-container">
            <Dropdown
                className="drill-to-dropdown s-drill-to-dropdown"
                closeOnParentScroll
                closeOnMouseDrag
                alignPoints={alignPoints}
                renderButton={({ isOpen, toggleDropdown }) => (
                    <DrillToDropdownButton
                        title={buttonValue}
                        value={buttonValue}
                        selection={selectedDrillToItem}
                        isOpen={isOpen}
                        onClick={toggleDropdown}
                    />
                )}
                renderBody={() => (
                    <NoData
                        hasNoMatchingData={true}
                        noDataLabel={intl.formatMessage({
                            id: "configurationPanel.noLinkableDashboards",
                        })}
                    />
                )}
            />
            {drillToItem ? (
                <Button
                    className="gd-button-link-dimmed gd-button-icon-only gd-icon-cross button-remove-drill-to s-button-remove-drill-to"
                    onClick={onDrillToRemove}
                />
            ) : null}
        </div>
    );
};

export const KpiDrillConfiguration: React.FC<IKpiDrillConfigurationProps> = (props) => {
    const isHidden = useDashboardSelector(selectShouldHidePixelPerfectExperience);

    if (isHidden) {
        return null;
    }

    return <KpiDrillConfigurationCore {...props} />;
};
