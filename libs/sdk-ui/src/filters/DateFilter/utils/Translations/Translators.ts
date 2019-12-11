// (C) 2019 GoodData Corporation
import { InjectedIntl } from "react-intl";

export interface IMessageTranslator {
    formatMessage: InjectedIntl["formatMessage"];
}

export interface IDateTranslator {
    formatDate: InjectedIntl["formatDate"];
}

export interface IDateAndMessageTranslator extends IDateTranslator, IMessageTranslator {}
