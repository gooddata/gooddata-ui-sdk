// (C) 2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import flatMap from "lodash/flatMap.js";
import sortBy from "lodash/sortBy.js";
import {
    Button,
    Dropdown,
    DropdownButton,
    DropdownList,
    IAlignPoint,
    NoData,
    SingleSelectListItem,
} from "@gooddata/sdk-ui-kit";
import { IKpiWidget, ObjRef, widgetRef } from "@gooddata/sdk-model";
import {
    removeDrillForKpiWidget,
    selectLegacyDashboards,
    selectShouldHidePixelPerfectExperience,
    setDrillForKpiWidget,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { CONFIG_PANEL_INNER_WIDTH } from "../constants.js";

const alignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];
const CONFIG_PANEL_DRILL_WIDTH = CONFIG_PANEL_INNER_WIDTH - 23;

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

    const onDrillToSelect = useCallback(
        (item: { identifier: string; dashboardRef: ObjRef }) => {
            dispatch(setDrillForKpiWidget(widgetRef(widget), item.dashboardRef, item.identifier));
        },
        [dispatch, widget],
    );

    const onDrillToRemove = useCallback(() => {
        dispatch(removeDrillForKpiWidget(widgetRef(widget)));
    }, [dispatch, widget]);

    const dashboards = useDashboardSelector(selectLegacyDashboards);

    const drillToItem = widget.drills?.[0]?.tab;

    const UNLISTED_DASHBOARD_TAB = {
        title: intl.formatMessage({ id: "configurationPanel.unlistedDashboardTab" }),
    };

    const drillToItems = useMemo(() => {
        if (!dashboards) {
            return [];
        }

        const sortedDashboards = sortBy(dashboards, (dashboard) => dashboard.title);
        return flatMap(sortedDashboards, (dash) => {
            return [
                {
                    title: dash.title,
                    identifier: dash.identifier,
                    dashboardRef: dash.ref,
                    type: "header" as const,
                },
                ...dash.tabs.map((tab) => {
                    return {
                        title: tab.title,
                        identifier: tab.identifier,
                        dashboardRef: dash.ref,
                        type: undefined,
                    };
                }),
            ];
        });
    }, [dashboards]);

    const foundDrillToItem = drillToItems?.find((item) => item.identifier === drillToItem);

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
                renderBody={({ closeDropdown }) => (
                    <DropdownList
                        isLoading={!dashboards}
                        renderNoData={({ hasNoMatchingData }) => (
                            <NoData
                                hasNoMatchingData={hasNoMatchingData}
                                noDataLabel={intl.formatMessage({
                                    id: "configurationPanel.noLinkableDashboards",
                                })}
                            />
                        )}
                        className="configuration-dropdown s-drill-to-list"
                        width={CONFIG_PANEL_DRILL_WIDTH}
                        items={drillToItems}
                        renderItem={({ item }) => {
                            const selected = selectedDrillToItem && selectedDrillToItem.title === item.title;

                            return (
                                <SingleSelectListItem
                                    title={item.title}
                                    isSelected={!!selected}
                                    type={item.type}
                                    onClick={() => {
                                        onDrillToSelect(item);
                                        closeDropdown();
                                    }}
                                />
                            );
                        }}
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
