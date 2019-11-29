// (C) 2019 GoodData Corporation
import { GdcProject } from "@gooddata/gd-bear-model";
import { IWorkspace } from "@gooddata/sdk-model";

export const convertUserProject = (userProject: GdcProject.IUserProject): IWorkspace => {
    return {
        description: userProject.projectDescription,
        title: userProject.projectTitle,
        id: userProject.links.self.match(/\/gdc\/projects\/(.+)/i)![1],
    };
};
