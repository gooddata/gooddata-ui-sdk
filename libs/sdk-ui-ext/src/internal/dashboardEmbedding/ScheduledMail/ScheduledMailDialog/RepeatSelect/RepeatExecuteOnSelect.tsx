// (C) 2019-2021 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Dropdown, DropdownList, DropdownButton, SingleSelectListItem } from "@gooddata/sdk-ui-kit";

import { IDropdownItem } from "../../interfaces";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX, REPEAT_EXECUTE_ON } from "../../constants";
import { getDate, getIntlDayName, getWeek } from "../../utils/datetime";

const DROPDOWN_WIDTH = 154;

interface IRepeatExecuteOnSelectOwnProps {
    repeatExecuteOn: string;
    startDate: Date;
    onChange: (repeatExecuteOn: string) => void;
}

export type IRepeatExecuteOnSelectProps = IRepeatExecuteOnSelectOwnProps & WrappedComponentProps;

class RenderRepeatExecuteOnSelect extends React.PureComponent<IRepeatExecuteOnSelectProps> {
    public render(): React.ReactNode {
        const repeatExecuteOnItems = this.getRepeatExecuteOnItems();
        const repeatExecuteOnItem = repeatExecuteOnItems.find(this.isRepeatExecuteOnItemSelected);

        return (
            <Dropdown
                alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
                className="gd-schedule-email-dialog-repeat-execute-on s-gd-schedule-email-dialog-repeat-execute-on"
                renderBody={({ closeDropdown, isMobile }) => (
                    <DropdownList
                        width={DROPDOWN_WIDTH}
                        items={repeatExecuteOnItems}
                        isMobile={isMobile}
                        renderItem={({ item }) => (
                            <SingleSelectListItem
                                title={item.title}
                                onClick={() => {
                                    this.onRepeatExecuteOnChange(item);
                                    closeDropdown();
                                }}
                                isSelected={repeatExecuteOnItem.id === item.id}
                            />
                        )}
                    />
                )}
                renderButton={({ toggleDropdown }) => (
                    <DropdownButton value={repeatExecuteOnItem.title} onClick={toggleDropdown} />
                )}
                overlayPositionType="sameAsTarget"
                overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
            />
        );
    }

    private isRepeatExecuteOnItemSelected = (item: IDropdownItem): boolean => {
        return item.id === this.props.repeatExecuteOn;
    };

    private getRepeatExecuteOnItem = (repeatExecuteOn: string): IDropdownItem => {
        const { intl, startDate } = this.props;
        return {
            id: repeatExecuteOn,
            title: intl.formatMessage(
                {
                    id: `dialogs.schedule.email.repeats.execute.on.${repeatExecuteOn}`,
                },
                {
                    date: getDate(startDate),
                    day: getIntlDayName(intl, startDate),
                    week: getWeek(startDate),
                },
            ),
        };
    };

    private getRepeatExecuteOnItems = (): IDropdownItem[] => {
        return [REPEAT_EXECUTE_ON.DAY_OF_MONTH, REPEAT_EXECUTE_ON.DAY_OF_WEEK].map(
            this.getRepeatExecuteOnItem,
        );
    };

    private onRepeatExecuteOnChange = (item: IDropdownItem) => {
        this.props.onChange(item.id);
    };
}

export const RepeatExecuteOnSelect = injectIntl(RenderRepeatExecuteOnSelect);
