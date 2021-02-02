// (C) 2021 GoodData Corporation

/**
 * @public
 */
export namespace WorkspaceObjectModel {
    export interface IWorkspace {
        attributes: {
            name: string;
        };
        id: string;
        links: {
            self: string;
        };
    }

    export interface IWorkspaceParams {
        page: number;
        size: number;
    }

    export interface IWorkspaceResponse {
        data: IWorkspace[];
    }
}
