// (C) 2007-2026 GoodData Corporation

export enum ArithmeticOperatorType {
    SUM = "sum",
    DIFFERENCE = "difference",
    MULTIPLICATION = "multiplication",
    RATIO = "ratio",
    CHANGE = "change",
}

export interface IOperatorDropdownItem {
    type: ArithmeticOperatorType;
    tooltip?: boolean;
}
