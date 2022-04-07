// (C) 2021-2022 GoodData Corporation
import { GdcUserGroup } from "@gooddata/api-model-bear";
import { uriRef, IWorkspaceUserGroup } from "@gooddata/sdk-model";

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
