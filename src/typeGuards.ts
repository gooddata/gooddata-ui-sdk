// (C) 2007-2019 GoodData Corporation
import { IGuidColorItem, IRGBColorItem, IColorItem } from './interfaces';

const isValidColorItem = (value: IColorItem | undefined | null): value is IColorItem =>
    !!(value && value.type && value.value !== undefined);

export const isGuidColorItem = (color: IColorItem | undefined | null): color is IGuidColorItem =>
    isValidColorItem(color) && color.type === 'guid';
export const isRgbColorItem = (color: IColorItem | undefined | null): color is IRGBColorItem =>
    isValidColorItem(color) && color.type === 'rgb';
