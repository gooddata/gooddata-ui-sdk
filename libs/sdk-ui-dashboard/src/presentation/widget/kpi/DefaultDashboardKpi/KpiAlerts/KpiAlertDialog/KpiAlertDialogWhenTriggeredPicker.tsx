// (C) 2021-2022 GoodData Corporation
import React, { useMemo } from "react";
import { WrappedComponentProps } from "react-intl";
import cx from "classnames";
import { Dropdown, DropdownButton, DropdownList, ShortenedText } from "@gooddata/sdk-ui-kit";
import { IWidgetAlertDefinition } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

interface IKpiAlertDialogWhenTriggeredPickerProps extends WrappedComponentProps {
    whenTriggered: IWidgetAlertDefinition["whenTriggered"];
    onWhenTriggeredChange: (whenTriggered: IWidgetAlertDefinition["whenTriggered"]) => void;
}

export const KpiAlertDialogWhenTriggeredPicker: React.FC<IKpiAlertDialogWhenTriggeredPickerProps> = ({
    intl,
    onWhenTriggeredChange,
    whenTriggered,
}) => {
    const alertTypeItems = useMemo(
        () => [
            { title: intl.formatMessage({ id: "kpiAlertDialog.threshold.above" }), id: "aboveThreshold" },
            { title: intl.formatMessage({ id: "kpiAlertDialog.threshold.below" }), id: "underThreshold" },
        ],
        [intl],
    );

    const selectedItem = alertTypeItems.find((item) => item.id === whenTriggered);

    return (
        <Dropdown
            className="alert-select s-alert_select"
            renderButton={({ toggleDropdown }) => (
                <DropdownButton
                    className="dropdown-button"
                    value={selectedItem?.title}
                    onClick={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    className="s-alert-list"
                    width={256}
                    items={alertTypeItems}
                    itemsCount={alertTypeItems.length}
                    renderItem={({ item }) => (
                        <div
                            className={cx(
                                "gd-list-item",
                                "gd-list-item-shortened",
                                `s-${stringUtils.simplifyText(item.title)}`,
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                onWhenTriggeredChange(item.id as IWidgetAlertDefinition["whenTriggered"]);
                                closeDropdown();
                            }}
                        >
                            <ShortenedText>{item.title}</ShortenedText>
                        </div>
                    )}
                />
            )}
        />
    );
};
