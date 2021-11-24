// (C) 2021 GoodData Corporation
import { IWorkspaceUserGroup } from "@gooddata/sdk-backend-spi";
import { GdcUserGroup } from "@gooddata/api-model-bear";
import { uriRef } from "@gooddata/sdk-model";

export const convertWorkspaceUserGroup = (group: GdcUserGroup.IUserGroupItem): IWorkspaceUserGroup => {
    const {
        content: { name, description, id },
        links,
    } = group;

    return {
        ref: uriRef(links!.self!),
        name,
        id: id!,
        description: description!,
    };
};
