// (C) 2023-2024 GoodData Corporation
import React from "react";
import { WrappedComponentProps } from "react-intl";
import cx from "classnames";
import { Dropdown, DropdownButton, DropdownList, ShortenedText } from "@gooddata/sdk-ui-kit";
import { IWidgetAlertDefinition } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

interface IWidgetAlertDialogWhenTriggeredPickerProps extends WrappedComponentProps {
    whenTriggered: IWidgetAlertDefinition["whenTriggered"];
    onWhenTriggeredChange: (whenTriggered: IWidgetAlertDefinition["whenTriggered"]) => void;
}

const alertTypeItems: { title: string; id: IWidgetAlertDefinition["whenTriggered"] }[] = [
    { title: "rises above", id: "aboveThreshold" },
    { title: "drops below", id: "underThreshold" },
    { title: "changes by more than", id: "outliers" },
];

export const WidgetAlertDialogWhenTriggeredPicker: React.FC<IWidgetAlertDialogWhenTriggeredPickerProps> = ({
    onWhenTriggeredChange,
    whenTriggered,
}) => {
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
                    width={211}
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
