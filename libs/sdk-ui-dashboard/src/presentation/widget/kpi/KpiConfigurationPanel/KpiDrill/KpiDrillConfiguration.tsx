// (C) 2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import flatMap from "lodash/flatMap";
import sortBy from "lodash/sortBy";
import {
    Button,
    Dropdown,
    DropdownButton,
    DropdownList,
    IAlignPoint,
    NoData,
    SingleSelectListItem,
    Typography,
} from "@gooddata/sdk-ui-kit";
import { IKpiWidget } from "@gooddata/sdk-model";
import {
    selectShouldHidePixelPerfectExperience,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { loadLegacyDashboards } from "./loadLegacyDashboards";
import { CONFIG_PANEL_INNER_WIDTH } from "../constants";

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
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const dispatch = useDashboardDispatch();

    const onDrillToSelect = useCallback(
        (_item: { identifier: string }) => {
            // TODO
        },
        [dispatch],
    );

    const onDrillToRemove = useCallback(() => {
        // TODO
    }, [dispatch]);

    const drillToItem = widget.drills?.[0]?.tab;

    const { result: dashboards, status } = useCancelablePromise(
        {
            promise: () => {
                return loadLegacyDashboards(backend, workspace); // TODO cache this?
            },
        },
        [backend, workspace],
    );

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
                    type: "header" as const,
                },
                ...dash.tabs.map((tab) => {
                    return {
                        title: tab.title,
                        identifier: tab.identifier,
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
        <div>
            <Typography tagName="h3">
                <FormattedMessage id="configurationPanel.drillIntoDashboard" />
            </Typography>

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
                            isLoading={status === "loading" || status === "pending"}
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
                                const selected =
                                    selectedDrillToItem && selectedDrillToItem.title === item.title;

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
        </div>
    );
};

export const KpiDrillConfiguration: React.FC<IKpiDrillConfigurationProps> = (props) => {
    const { widget } = props;

    const isHidden = useDashboardSelector(selectShouldHidePixelPerfectExperience);

    if (isHidden) {
        return null;
    }

    if (!widget.kpi.metric) {
        return (
            <div>
                <Typography tagName="h3" className="is-disabled">
                    <FormattedMessage id="configurationPanel.drillIntoDashboard" />
                </Typography>
            </div>
        );
    }

    return <KpiDrillConfigurationCore {...props} />;
};
