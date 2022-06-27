// (C) 2019-2022 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { Dropdown, DropdownList, DropdownButton, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import invariant from "ts-invariant";

import { IDropdownItem } from "../../interfaces";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX, FREQUENCY_TYPE } from "../../constants";
import { messages } from "../../../../../locales";

const DROPDOWN_WIDTH = 100;

export interface IRepeatFrequencySelectProps {
    repeatFrequency: string;
    repeatPeriod: number;
    onChange: (repeatFrequency: string) => void;
}

export const RepeatFrequencySelect: React.FC<IRepeatFrequencySelectProps> = (props) => {
    const { onChange, repeatFrequency, repeatPeriod } = props;
    const intl = useIntl();

    const repeatFrequencyItems = useMemo(() => {
        return FREQUENCY_TYPE.map((id): IDropdownItem => {
            return {
                id,
                title: intl.formatMessage(messages[`scheduleDialogEmailRepeatsFrequencies_${id}`], {
                    n: repeatPeriod,
                }),
            };
        });
    }, [intl, repeatPeriod]);

    const repeatFrequencyItem = repeatFrequencyItems.find((item) => item.id === repeatFrequency);

    invariant(repeatFrequencyItem, "Inconsistent state in RepeatFrequencySelect");

    return (
        <Dropdown
            alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
            className="gd-schedule-email-dialog-repeat-frequency s-gd-schedule-email-dialog-repeat-frequency"
            renderButton={({ toggleDropdown }) => (
                <DropdownButton value={repeatFrequencyItem.title} onClick={toggleDropdown} />
            )}
            renderBody={({ closeDropdown, isMobile }) => (
                <DropdownList
                    width={DROPDOWN_WIDTH}
                    items={repeatFrequencyItems}
                    isMobile={isMobile}
                    renderItem={({ item }) => (
                        <SingleSelectListItem
                            title={item.title}
                            onClick={() => {
                                onChange(item.id);
                                closeDropdown();
                            }}
                            isSelected={repeatFrequencyItem.id === item.id}
                        />
                    )}
                />
            )}
            overlayPositionType="sameAsTarget"
            overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
        />
    );
};
