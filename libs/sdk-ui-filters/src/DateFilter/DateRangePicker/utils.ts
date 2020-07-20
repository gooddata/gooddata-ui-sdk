// (C) 2007-2020 GoodData Corporation
import moment from "moment";
import { DayPickerProps } from "react-day-picker/types/props";
import { Modifiers } from "react-day-picker/types/common";

const mergeModifiers = (
    defaultModifiers: Partial<Modifiers> | undefined,
    userModifiers: Partial<Modifiers> | undefined,
): { modifiers: Partial<Modifiers> } | undefined =>
    defaultModifiers ? { modifiers: { ...defaultModifiers, ...userModifiers } } : undefined;

const mergeDayPickerPropsBody = (
    defaultProps: DayPickerProps,
    userProps: DayPickerProps,
): DayPickerProps => ({
    ...defaultProps,
    ...userProps,
    ...mergeModifiers(defaultProps.modifiers, userProps.modifiers),
});

export const mergeDayPickerProps = (
    defaultProps: DayPickerProps,
    userProps: DayPickerProps | undefined,
): DayPickerProps => (userProps ? mergeDayPickerPropsBody(defaultProps, userProps) : defaultProps);

export const areRangeBoundsCrossed = (from: Date, to: Date) =>
    from && to ? moment(from).isAfter(moment(to)) : false;
