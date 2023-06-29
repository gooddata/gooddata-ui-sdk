// (C) 2019-2023 GoodData Corporation
import React, { useMemo } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { Dropdown, DropdownList, DropdownButton, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import { invariant } from "ts-invariant";

import { IDropdownItem } from "../../interfaces.js";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX, REPEAT_TYPES } from "../../constants.js";
import { getWeek, getIntlDayName } from "../../utils/datetime.js";
import { messages } from "../../../../../locales.js";

const DROPDOWN_WIDTH = 199;

const getLocalizationKey = (id: string): MessageDescriptor => {
    switch (id) {
        case REPEAT_TYPES.DAILY:
            return messages.scheduleDialogEmailRepeats_daily;
        case REPEAT_TYPES.WEEKLY:
            return messages.scheduleDialogEmailRepeats_weekly;
        case REPEAT_TYPES.MONTHLY:
            return messages.scheduleDialogEmailRepeats_monthly;
        case REPEAT_TYPES.CUSTOM:
            return messages.scheduleDialogEmailRepeats_custom;
        default:
            throw new Error("Invariant: Unexpected localization key.");
    }
};

export interface IRepeatTypeSelectProps {
    repeatType: string;
    startDate: Date;
    onChange: (repeatType: string) => void;
}

export const RepeatTypeSelect: React.FC<IRepeatTypeSelectProps> = (props) => {
    const { onChange, repeatType, startDate } = props;
    const intl = useIntl();

    const repeatItems = useMemo(() => {
        return [REPEAT_TYPES.DAILY, REPEAT_TYPES.WEEKLY, REPEAT_TYPES.MONTHLY, REPEAT_TYPES.CUSTOM].map(
            (id): IDropdownItem => {
                const localizationKey = getLocalizationKey(id);

                return {
                    id,
                    title: intl.formatMessage(localizationKey, {
                        day: getIntlDayName(intl, startDate),
                        week: getWeek(startDate),
                    }),
                };
            },
        );
    }, [intl, startDate]);

    const repeatTypeItem = repeatItems.find((item) => item.id === repeatType);

    invariant(repeatTypeItem, "Inconsistent state in RepeatTypeSelect");

    return (
        <Dropdown
            alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
            className="gd-schedule-email-dialog-repeat-type s-gd-schedule-email-dialog-repeat-type"
            renderButton={({ toggleDropdown }) => (
                <DropdownButton value={repeatTypeItem.title} onClick={toggleDropdown} />
            )}
            renderBody={({ closeDropdown, isMobile }) => (
                <DropdownList
                    width={DROPDOWN_WIDTH}
                    items={repeatItems}
                    isMobile={isMobile}
                    renderItem={({ item }) => (
                        <SingleSelectListItem
                            title={item.title}
                            onClick={() => {
                                onChange(item.id);
                                closeDropdown();
                            }}
                            isSelected={repeatTypeItem.id === item.id}
                        />
                    )}
                />
            )}
            overlayPositionType="sameAsTarget"
            overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
        />
    );
};
