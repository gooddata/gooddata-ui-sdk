// (C) 2019-2020 GoodData Corporation
import { IWorkspaceUsersQuery, IWorkspaceUsersQueryOptions, IWorkspaceUser } from "@gooddata/sdk-backend-spi";

import { BearAuthenticatedCallGuard } from "../../../types";
import { convertWorkspaceUser } from "../../../convertors/toSdkModel/UsersConverter";

export class BearWorkspaceUsersQuery implements IWorkspaceUsersQuery {
    private options: IWorkspaceUsersQueryOptions = {};

    constructor(private readonly authCall: BearAuthenticatedCallGuard, private readonly workspace: string) {}

    public withOptions(options: IWorkspaceUsersQueryOptions): IWorkspaceUsersQuery {
        this.options = options;
        return this;
    }

    public async queryAll(): Promise<IWorkspaceUser[]> {
        const { search } = this.options;
        return this.authCall(sdk =>
            sdk.project
                .getUserList(this.workspace, { prefixSearch: search, userState: "ACTIVE" })
                .then(users => users.map(convertWorkspaceUser)),
        );
    }
}
