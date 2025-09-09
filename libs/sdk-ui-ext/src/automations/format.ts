// (C) 2025 GoodData Corporation

import moment from "moment-timezone";
import { IntlShape } from "react-intl";

import {
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAutomationAlert,
    IExportDefinitionMetadataObject,
    IOrganizationUser,
    IUser,
    IWorkspaceUser,
    isIOrganizationUser,
} from "@gooddata/sdk-model";
import { UiAsyncTableFilterOption } from "@gooddata/sdk-ui-kit";

import { ARITHMETIC_OPERATORS, DATE_FORMAT, EMPTY_CELL_VALUES } from "./constants.js";
import { messages } from "./messages.js";
import { CellValueType } from "./types.js";
import { getComparisonOperatorTitle, getRelativeOperatorTitle } from "./utils.js";

//cells
export const formatAlertSubtitle = (intl: IntlShape, alert?: IAutomationAlert) => {
    if (alert?.condition.type === "relative") {
        const relativeOperatorTitle = getRelativeOperatorTitle(
            alert.condition.operator as IAlertRelativeOperator,
            alert.condition.measure.operator as IAlertRelativeArithmeticOperator,
            intl,
        )?.toLowerCase();

        return (
            `${alert.condition.measure.left.title} ${relativeOperatorTitle} ${alert.condition.threshold}` +
            `${
                alert.condition.measure.operator === ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE
                    ? " %"
                    : ""
            }`
        );
    }
    if (alert?.condition.type === "comparison") {
        const comparisonOperatorTitle = getComparisonOperatorTitle(
            alert.condition.operator,
            intl,
        )?.toLowerCase();
        return `${alert.condition.left.title} ${comparisonOperatorTitle} ${alert.condition.right}`;
    }
    return "";
};

export const formatAttachments = (attachments?: IExportDefinitionMetadataObject[]) => {
    return attachments?.map((attachment) => attachment.requestPayload?.format).join(", ");
};

export const formatAutomationUser = (user?: IUser) => {
    if (!user) {
        return "";
    }
    const { firstName, lastName, email = "" } = user;

    if (firstName || lastName) {
        return [firstName, lastName].filter(Boolean).join(" ");
    }
    return email;
};

export const formatDate = (date: string, timeZone: string) => {
    if (!date) return "";

    return moment(date).tz(timeZone).format(DATE_FORMAT);
};

export function formatCellValue(
    value: string | number | undefined | null,
    type: CellValueType = "text",
    timezone?: string,
): string {
    if (value === undefined || value === null) {
        return EMPTY_CELL_VALUES[type];
    }

    switch (type) {
        case "date":
            try {
                return formatDate(String(value), timezone);
            } catch {
                return EMPTY_CELL_VALUES[type];
            }
        case "number":
        case "text":
        default:
            return String(value);
    }
}

//filters
const formatWorkspaceUser = (user?: IWorkspaceUser | IOrganizationUser, intl?: IntlShape) => {
    if (!user) {
        return { label: "" };
    }
    const { fullName, email } = user;

    if (fullName) {
        return { label: fullName, secondaryLabel: email };
    }
    return { label: email ?? intl?.formatMessage(messages.untitledUser) };
};

const getUserIdentifier = (user: IWorkspaceUser | IOrganizationUser) => {
    if (isIOrganizationUser(user)) {
        return user.id;
    }
    return user.uri;
};

export const formatWorkspaceUserFilterOptions = (
    users: IWorkspaceUser[] | IOrganizationUser[],
    isCurrentUser: (login: string) => boolean,
    intl: IntlShape,
): UiAsyncTableFilterOption[] => {
    return users.map((item) => {
        const login = isIOrganizationUser(item) ? item.email : item.login;
        const current = login ? isCurrentUser(login) : false;
        const { label, secondaryLabel } = formatWorkspaceUser(item, intl);
        return {
            value: getUserIdentifier(item),
            label: current ? intl.formatMessage(messages.currentUser) : label,
            secondaryLabel: secondaryLabel,
        };
    });
};
