// (C) 2019-2020 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";

/**
 * @public
 */
export namespace GdcProjectDashboard {
    export interface IProjectDashboard {
        content: {
            tabs: Array<{ title: string; identifier: string }>;
        };
        meta: GdcMetadata.IObjectMeta;
    }

    export interface IWrappedProjectDashboard {
        projectDashboard: IProjectDashboard;
    }
}
