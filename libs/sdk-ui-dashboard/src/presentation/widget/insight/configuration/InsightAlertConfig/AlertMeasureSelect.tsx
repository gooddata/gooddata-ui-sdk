// (C) 2019-2024 GoodData Corporation
import React from "react";
import { Dropdown, Button, List, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import { IMeasure } from "@gooddata/sdk-model";
import cx from "classnames";
import { getMeasureTitle } from "./utils.js";
import { DROPDOWN_ITEM_HEIGHT } from "./constants.js";

export interface IAlertMetricSelectProps {
    selectedMeasureIdentifier: string;
    onMeasureChange: (measure: IMeasure) => void;
    measures: IMeasure[];
}

const measureIcon = <div className="gd-alert-measure-select__icon gd-icon-metric" />;

export const AlertMeasureSelect = ({
    selectedMeasureIdentifier,
    onMeasureChange,
    measures,
}: IAlertMetricSelectProps) => {
    const selectedMeasure = measures.find(
        (measure) => measure.measure.localIdentifier === selectedMeasureIdentifier,
    );

    if (!selectedMeasure) {
        return null;
    }

    const selectedMeasureTitle = getMeasureTitle(selectedMeasure);

    return (
        <div className="gd-alert-measure-select">
            <Dropdown
                renderButton={({ isOpen, toggleDropdown }) => {
                    return (
                        <Button
                            className={cx("gd-alert-measure-select__button s-alert-measure-select", {
                                "is-active": isOpen,
                            })}
                            size="small"
                            variant="secondary"
                            iconLeft="gd-icon-metric"
                            iconRight={`gd-icon-navigate${isOpen ? "up" : "down"}`}
                            onClick={toggleDropdown}
                        >
                            {selectedMeasureTitle}
                        </Button>
                    );
                }}
                renderBody={({ closeDropdown }) => {
                    return (
                        <List
                            className="gd-alert-measure-select__list s-alert-measure-select-list"
                            items={measures}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            renderItem={(i) => (
                                <SingleSelectListItem
                                    key={i.rowIndex}
                                    icon={measureIcon}
                                    title={getMeasureTitle(i.item)}
                                    isSelected={i.item === selectedMeasure}
                                    onClick={() => {
                                        onMeasureChange(i.item);
                                        closeDropdown();
                                    }}
                                />
                            )}
                        />
                    );
                }}
            />
        </div>
    );
};
