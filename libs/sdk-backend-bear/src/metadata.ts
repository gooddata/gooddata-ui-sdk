// (C) 2019 GoodData Corporation
import { IWorkspaceMetadata } from "@gooddata/sdk-backend-spi";
import { IVisualizationClass, IInsight } from "@gooddata/sdk-model";
import { AuthenticatedSdkProvider } from "./commonTypes";
import { VisualizationClass } from "@gooddata/gd-bear-model";
import { convertVisualizationClass } from "./toSdkModel/VisualizationClassConverter";
import { convertVisualization } from "./toSdkModel/VisualizationConverter";

export class BearWorkspaceMetadata implements IWorkspaceMetadata {
    constructor(private readonly authSdk: AuthenticatedSdkProvider, public readonly workspace: string) {}

    public getVisualizationClass = async (id: string): Promise<IVisualizationClass> => {
        const sdk = await this.authSdk();
        const uri = await sdk.md.getObjectUri(this.workspace, id);
        const visClassResult = await sdk.md.getObjects(this.workspace, [uri]);

        return convertVisualizationClass(visClassResult[0]);
    };

    public getVisualizationClasses = async (): Promise<IVisualizationClass[]> => {
        const sdk = await this.authSdk();

        const visualizationClassesResult: VisualizationClass.IVisualizationClassWrapped[] = await sdk.md.getObjectsByQuery(
            this.workspace,
            {
                category: "visualizationClass",
            },
        );

        return visualizationClassesResult.map(convertVisualizationClass);
    };

    public getInsight = async (id: string): Promise<IInsight> => {
        const sdk = await this.authSdk();
        const uri = await sdk.md.getObjectUri(this.workspace, id);
        const visualization = await sdk.md.getVisualization(uri);

        const visClassResult = await sdk.md.getObjects(this.workspace, [
            visualization.visualizationObject.content.visualizationClass.uri,
        ]);

        const visClass = visClassResult[0];
        const visualizationClassIdentifier = visClass.visualizationClass.meta.identifier;

        return convertVisualization(visualization, visualizationClassIdentifier);
    };
}
