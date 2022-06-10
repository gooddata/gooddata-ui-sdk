// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Dropdown, DropdownList, DropdownButton, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import invariant from "ts-invariant";

import { IDropdownItem } from "../../interfaces";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX, FREQUENCY_TYPE } from "../../constants";
import { messages } from "../../../../../locales";

const DROPDOWN_WIDTH = 100;

interface IRepeatFrequencySelectOwnProps {
    repeatFrequency: string;
    repeatPeriod: number;
    onChange: (repeatFrequency: string) => void;
}

export type IRepeatFrequencySelectProps = IRepeatFrequencySelectOwnProps & WrappedComponentProps;

class RenderRepeatFrequencySelect extends React.PureComponent<IRepeatFrequencySelectProps> {
    public render(): React.ReactNode {
        const repeatFrequencyItems = this.getRepeatFrequencyItems();
        const repeatFrequencyItem = repeatFrequencyItems.find(this.isRepeatFrequencyItemSelected);
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
                                    this.onRepeatFrequencyChange(item);
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
    }

    private isRepeatFrequencyItemSelected = (item: IDropdownItem): boolean => {
        return item.id === this.props.repeatFrequency;
    };

    private getRepeatFrequencyItem = (repeatFrequency: string): IDropdownItem => {
        const { intl, repeatPeriod } = this.props;
        return {
            id: repeatFrequency,
            title: intl.formatMessage(messages[`scheduleDialogEmailRepeatsFrequencies_${repeatFrequency}`], {
                n: repeatPeriod,
            }),
        };
    };

    private getRepeatFrequencyItems = (): IDropdownItem[] => {
        return FREQUENCY_TYPE.map(this.getRepeatFrequencyItem);
    };

    private onRepeatFrequencyChange = (item: IDropdownItem) => {
        this.props.onChange(item.id);
    };
}

export const RepeatFrequencySelect = injectIntl(RenderRepeatFrequencySelect);
