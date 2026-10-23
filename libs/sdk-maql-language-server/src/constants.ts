// (C) 2021-2026 GoodData Corporation

export const LanguageId: string = "maql";

export const diagnosticsSource = LanguageId.toUpperCase();

export enum ErrorCodes {
    InputMismatch = 0,
    NoViableAlternative = 1,
    FailedPredicate = 2,
    UnspecifiedError = 3,
    UnrecognizedInput = 4,
    UnterminatedString = 5,
    UndefinedKeyword = 6,
    InvalidType = 7,
    ExtraIdentifiersInObject = 8,
    ObjectNotFound = 9,
    LabelElementNotFound = 10,
    InvalidOperator = 11,
    SuspiciousStringLiteral = 12,
    ParameterValueNotAllowed = 13,
    ParameterValueUncovered = 14,
    InvalidLabelElementValue = 15,
}
