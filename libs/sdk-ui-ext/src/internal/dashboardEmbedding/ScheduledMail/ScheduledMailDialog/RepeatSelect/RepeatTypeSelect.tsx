// (C) 2019-2021 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Dropdown, DropdownList, DropdownButton, SingleSelectListItem } from "@gooddata/sdk-ui-kit";

import { IDropdownItem } from "../../interfaces";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX, REPEAT_TYPES } from "../../constants";
import { getWeek, getIntlDayName } from "../../utils/datetime";

const DROPDOWN_WIDTH = 199;

interface IRepeatTypeSelectOwnProps {
    repeatType: string;
    startDate: Date;
    onChange: (repeatType: string) => void;
}

export type IRepeatTypeSelectProps = IRepeatTypeSelectOwnProps & WrappedComponentProps;

class RenderRepeatTypeSelect extends React.PureComponent<IRepeatTypeSelectProps> {
    public render(): React.ReactNode {
        const repeatItems = this.getRepeatTypeItems();
        const repeatTypeItem = repeatItems.find(this.isRepeatTypeItemSelected);

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
                                    this.onRepeatTypeChange(item);
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
    }

    private isRepeatTypeItemSelected = (item: IDropdownItem): boolean => {
        return item.id === this.props.repeatType;
    };

    private getRepeatTypeItem = (repeatType: string): IDropdownItem => {
        const { intl, startDate } = this.props;
        return {
            id: repeatType,
            title: intl.formatMessage(
                { id: `dialogs.schedule.email.repeats.types.${repeatType}` },
                {
                    day: getIntlDayName(intl, startDate),
                    week: getWeek(startDate),
                },
            ),
        };
    };

    private getRepeatTypeItems = (): IDropdownItem[] => {
        return [REPEAT_TYPES.DAILY, REPEAT_TYPES.WEEKLY, REPEAT_TYPES.MONTHLY, REPEAT_TYPES.CUSTOM].map(
            this.getRepeatTypeItem,
        );
    };

    private onRepeatTypeChange = (item: IDropdownItem) => {
        this.props.onChange(item.id);
    };
}

export const RepeatTypeSelect = injectIntl(RenderRepeatTypeSelect);
