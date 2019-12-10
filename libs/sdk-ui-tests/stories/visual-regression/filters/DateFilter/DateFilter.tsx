// (C) 2007-2019 GoodData Corporation
import { DateFilter, defaultDateFilterOptions } from "@gooddata/sdk-ui";
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { screenshotWrap } from "../../_infra/screenshotWrap";
import { DateFilterStories } from "../../_infra/storyGroups";

import "@gooddata/sdk-ui/styles/css/dateFilter.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

storiesOf(`${DateFilterStories}/DateFilter`, module)
    .add("full-featured", () => {
        return screenshotWrap(
            <div style={wrapperStyle} className="screenshot-target">
                <DateFilter
                    excludeCurrentPeriod={false}
                    selectedFilterOption={defaultDateFilterOptions.allTime}
                    filterOptions={defaultDateFilterOptions}
                    availableGranularities={[
                        "GDC.time.date",
                        "GDC.time.month",
                        "GDC.time.quarter",
                        "GDC.time.year",
                    ]}
                    isEditMode={false}
                    dateFilterMode="active"
                    onApply={action("applyClick")}
                    onCancel={action("cancelClick")}
                    onOpen={action("onOpen")}
                    onClose={action("onClose")}
                />
            </div>,
        );
    })
    .add("full-featured opened", () => {
        class DateFilterController extends React.Component<{}, {}> {
            public render() {
                return (
                    <DateFilter
                        excludeCurrentPeriod={false}
                        selectedFilterOption={defaultDateFilterOptions.allTime}
                        filterOptions={defaultDateFilterOptions}
                        availableGranularities={[
                            "GDC.time.date",
                            "GDC.time.month",
                            "GDC.time.quarter",
                            "GDC.time.year",
                        ]}
                        isEditMode={false}
                        customFilterName="My Date Filter"
                        dateFilterMode="active"
                        onApply={action("applyClick")}
                        onCancel={action("cancelClick")}
                        onOpen={action("onOpen")}
                        onClose={action("onClose")}
                    />
                );
            }

            public componentDidMount(): void {
                this.forceOpenDropdown();
            }

            private forceOpenDropdown() {
                (document.getElementsByClassName("s-date-filter-button")[0] as any).click();
            }
        }

        return screenshotWrap(
            <div style={wrapperStyle} className="screenshot-target">
                <DateFilterController />
            </div>,
        );
    })
    .add("localized", () => {
        class DateFilterController extends React.Component<{}, {}> {
            public render() {
                return (
                    <DateFilter
                        locale="de-DE"
                        excludeCurrentPeriod={false}
                        selectedFilterOption={defaultDateFilterOptions.allTime}
                        filterOptions={defaultDateFilterOptions}
                        availableGranularities={[
                            "GDC.time.date",
                            "GDC.time.month",
                            "GDC.time.quarter",
                            "GDC.time.year",
                        ]}
                        isEditMode={false}
                        dateFilterMode="active"
                    />
                );
            }
        }

        return screenshotWrap(
            <div style={wrapperStyle} className="screenshot-target">
                <DateFilterController />
            </div>,
        );
    })
    .add("localized - opened", () => {
        class DateFilterController extends React.Component<{}, {}> {
            public render() {
                return (
                    <DateFilter
                        locale="de-DE"
                        excludeCurrentPeriod={false}
                        selectedFilterOption={defaultDateFilterOptions.allTime}
                        filterOptions={defaultDateFilterOptions}
                        availableGranularities={[
                            "GDC.time.date",
                            "GDC.time.month",
                            "GDC.time.quarter",
                            "GDC.time.year",
                        ]}
                        isEditMode={false}
                        dateFilterMode="active"
                    />
                );
            }

            public componentDidMount(): void {
                this.forceOpenDropdown();
            }

            private forceOpenDropdown() {
                (document.getElementsByClassName("s-date-filter-button")[0] as any).click();
            }
        }

        return screenshotWrap(
            <div style={wrapperStyle} className="screenshot-target">
                <DateFilterController />
            </div>,
        );
    });
