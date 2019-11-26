// (C) 2019 GoodData Corporation
import { IntlShape } from "react-intl";

export interface IMessageTranslator {
    formatMessage: IntlShape["formatMessage"];
}

export interface IDateTranslator {
    formatDate: IntlShape["formatDate"];
}

export interface IDateAndMessageTranslator extends IDateTranslator, IMessageTranslator {}
