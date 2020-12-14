// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
// TODO: RAIL-2760: Migrate to sdk-ui-kit
import Dropdown, { DropdownBody, DropdownButton } from "@gooddata/goodstrap/lib/Dropdown/Dropdown";

import { IDropdownItem } from "../../interfaces";
import { DEFAULT_DROPDOWN_ALIGN_POINTS, DEFAULT_DROPDOWN_ZINDEX, FREQUENCY_TYPE } from "../../constants";

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

        return (
            <Dropdown
                alignPoints={DEFAULT_DROPDOWN_ALIGN_POINTS}
                className="gd-schedule-email-dialog-repeat-frequency s-gd-schedule-email-dialog-repeat-frequency"
                button={<DropdownButton value={repeatFrequencyItem.title} />}
                body={
                    <DropdownBody
                        width={DROPDOWN_WIDTH}
                        items={repeatFrequencyItems}
                        selection={repeatFrequencyItem}
                        onSelect={this.onRepeatFrequencyChange}
                    />
                }
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
            title: intl.formatMessage(
                {
                    id: `dialogs.schedule.email.repeats.frequencies.${repeatFrequency}`,
                },
                {
                    n: repeatPeriod,
                },
            ),
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
