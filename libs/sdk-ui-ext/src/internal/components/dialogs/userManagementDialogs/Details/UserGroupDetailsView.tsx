// (C) 2023-2025 GoodData Corporation

import { IUserGroup } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";
import noop from "lodash/noop.js";

import { ListMode } from "../types.js";
import { messages } from "../locales.js";

import { DetailRow } from "./DetailRow.js";

export interface IUserGroupDetailsViewProps {
    userGroup: IUserGroup;
    mode: ListMode;
    onChange?: (user: IUserGroup) => void;
}

export function UserGroupDetailsView({ userGroup, mode, onChange }: IUserGroupDetailsViewProps) {
    const intl = useIntl();

    if (!userGroup) {
        return null;
    }

    return (
        <div className="gd-user-management-dialog-detail">
            <DetailRow
                labelText={intl.formatMessage(messages.userGroupName)}
                value={userGroup.name}
                mode={mode}
                onChange={(name) => onChange({ ...userGroup, name })}
            />
            <DetailRow
                labelText={intl.formatMessage(messages.userGroupId)}
                value={userGroup.id}
                mode={mode}
                disabled={true}
                onChange={noop}
            />
        </div>
    );
}
