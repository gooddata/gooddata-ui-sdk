// (C) 2007-2018 GoodData Corporation

export type OpenAction = 'click' | 'hover';

export type MenuAlignment =
    | ['bottom', 'right']
    | ['bottom', 'left']
    | ['top', 'right']
    | ['top', 'left']
    | ['right', 'top']
    | ['right', 'bottom']
    | ['left', 'top']
    | ['left', 'bottom'];

export interface IMenuPositionConfig {
    alignment: MenuAlignment;
    spacing: number;
    offset: number;
}
