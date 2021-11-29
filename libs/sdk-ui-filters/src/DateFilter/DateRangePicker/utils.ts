// (C) 2007-2021 GoodData Corporation
import moment from "moment";
import { DayPickerProps, Modifiers } from "react-day-picker";

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

export const areRangeBoundsCrossed = (from: Date, to: Date): boolean =>
    from && to ? moment(from).isAfter(moment(to)) : false;
