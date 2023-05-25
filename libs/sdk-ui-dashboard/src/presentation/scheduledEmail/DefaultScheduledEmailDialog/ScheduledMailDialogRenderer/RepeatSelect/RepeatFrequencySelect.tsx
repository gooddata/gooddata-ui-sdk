// (C) 2019-2023 GoodData Corporation
import React, { useMemo } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { Dropdown, DropdownList, DropdownButton, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import { invariant } from "ts-invariant";

import { IDropdownItem } from "../../interfaces.js";
import {
    DEFAULT_DROPDOWN_ALIGN_POINTS,
    DEFAULT_DROPDOWN_ZINDEX,
    FREQUENCY_TYPE,
    REPEAT_FREQUENCIES,
} from "../../constants.js";
import { messages } from "../../../../../locales.js";

const DROPDOWN_WIDTH = 100;

const getLocalizationKey = (id: string): MessageDescriptor => {
    switch (id) {
        case REPEAT_FREQUENCIES.DAY:
            return messages.scheduleDialogEmailRepeatsFrequencies_day;
        case REPEAT_FREQUENCIES.MONTH:
            return messages.scheduleDialogEmailRepeatsFrequencies_month;
        case REPEAT_FREQUENCIES.WEEK:
            return messages.scheduleDialogEmailRepeatsFrequencies_week;
        default:
            throw new Error("Invariant: Unexpected localization key.");
    }
};

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
            const localizationKey = getLocalizationKey(id);

            return {
                id,
                title: intl.formatMessage(localizationKey, {
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
