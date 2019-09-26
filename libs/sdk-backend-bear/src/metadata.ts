// (C) 2019 GoodData Corporation
import { IWorkspaceMetadata, NotImplemented } from "@gooddata/sdk-backend-spi";
import { IVisualizationClass, IInsight } from "@gooddata/sdk-model";
import { AuthenticatedSdkProvider } from "./commonTypes";
import { VisualizationClass } from "@gooddata/gd-bear-model";

export class BearWorkspaceMetadata implements IWorkspaceMetadata {
    constructor(private readonly authSdk: AuthenticatedSdkProvider, public readonly workspace: string) {}

    public getVisualizationClass = (_id: string): Promise<IVisualizationClass> => {
        throw new NotImplemented("getVisualizationClass not yet implemented");
    };
    public getVisualizationClasses = async (): Promise<IVisualizationClass[]> => {
        const sdk = await this.authSdk();

        const visualizationClassesResult: VisualizationClass.IVisualizationClassWrapped[] = await sdk.md.getObjectsByQuery(
            this.workspace,
            {
                category: "visualizationClass",
            },
        );

        return visualizationClassesResult.map(
            // TODO move the mapper elsewhere
            (visClass): IVisualizationClass => {
                const { content, meta } = visClass.visualizationClass;
                return {
                    visualizationClass: {
                        ...content,
                        identifier: meta.identifier!, // TODO this will never be falsy right?
                        title: meta.title,
                        uri: meta.uri,
                    },
                };
            },
        );
    };
    public getInsight = (_id: string): Promise<IInsight> => {
        throw new NotImplemented("getInsight");
    };
}
