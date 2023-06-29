// (C) 2007-2022 GoodData Corporation
import moment from "moment";
import { DayModifiers, DayPickerRangeProps } from "react-day-picker";
import { platformDateFormat, TIME_FORMAT } from "../constants/Platform.js";

const mergeModifiers = (
    defaultModifiers: Partial<DayModifiers> | undefined,
    userModifiers: Partial<DayModifiers> | undefined,
): { modifiers: Partial<DayModifiers> } | undefined =>
    defaultModifiers ? { modifiers: { ...defaultModifiers, ...userModifiers } } : undefined;

const mergeDayPickerPropsBody = (
    defaultProps: DayPickerRangeProps,
    userProps: DayPickerRangeProps,
): DayPickerRangeProps => ({
    ...defaultProps,
    ...userProps,
    ...mergeModifiers(defaultProps.modifiers, userProps.modifiers),
});

export const mergeDayPickerProps = (
    defaultProps: DayPickerRangeProps,
    userProps: DayPickerRangeProps | undefined,
): DayPickerRangeProps => (userProps ? mergeDayPickerPropsBody(defaultProps, userProps) : defaultProps);

export const areRangeBoundsCrossed = (from: Date, to: Date): boolean =>
    from && to ? moment(from).isAfter(moment(to)) : false;

export const getPlatformStringFromDate = (value: Date) => moment(value).format(platformDateFormat);

export const getTimeStringFromDate = (value: Date | undefined) => moment(value).format(TIME_FORMAT);
