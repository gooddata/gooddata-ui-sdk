// (C) 2021-2022 GoodData Corporation
import {
    IWorkspaceUserGroupsQuery,
    IWorkspaceUserGroupsQueryOptions,
    IWorkspaceUserGroupsQueryResult,
} from "@gooddata/sdk-backend-spi";
import { IWorkspaceUserGroup } from "@gooddata/sdk-model";

import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { convertWorkspaceUserGroup } from "../../../convertors/fromBackend/UserGroupsConverter.js";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { GdcUserGroup } from "@gooddata/api-model-bear";

export class BearWorkspaceUserGroupsQuery implements IWorkspaceUserGroupsQuery {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, private readonly workspace: string) {}

    private async queryAllPages(limit: number): Promise<GdcUserGroup.IWrappedUserGroupItem[]> {
        const data = await this.authCall((sdk) => sdk.project.getUserGroups(this.workspace, { limit }));
        const { items, paging } = data.userGroups;

        const getNextPage = async (
            nextUri: string | null | undefined,
            result: GdcUserGroup.IWrappedUserGroupItem[] = [],
        ): Promise<GdcUserGroup.IWrappedUserGroupItem[]> => {
            if (!nextUri) {
                return result;
            }

            const data = await this.authCall((sdk) =>
                sdk.xhr.getParsed<GdcUserGroup.IGetUserGroupsResponse>(nextUri!),
            );
            const { items, paging } = data.userGroups;
            const updatedResult = [...result, ...items];
            nextUri = paging.next!;

            return getNextPage(paging.next, updatedResult);
        };

        return getNextPage(paging.next, items);
    }

    public async query(options: IWorkspaceUserGroupsQueryOptions): Promise<IWorkspaceUserGroupsQueryResult> {
        const { offset = 0, limit = 100, search } = options;
        let userGroups: GdcUserGroup.IWrappedUserGroupItem[] = await this.queryAllPages(limit);
        if (search) {
            const lowercaseSearch = search.toLocaleLowerCase();
            userGroups = userGroups.filter((userGroup) => {
                const { name } = userGroup.userGroup.content;
                return name?.toLowerCase().indexOf(lowercaseSearch) > -1;
            });
        }
        const convertedUserGroups: IWorkspaceUserGroup[] = userGroups.map((userGroup) =>
            convertWorkspaceUserGroup(userGroup.userGroup),
        );
        return new InMemoryPaging<IWorkspaceUserGroup>(convertedUserGroups, limit, offset);
    }
}
