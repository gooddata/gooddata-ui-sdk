// (C) 2019 GoodData Corporation
import { IWorkspaceMetadata } from "@gooddata/sdk-backend-spi";
import { IVisualizationClass, IInsight, IAttributeDisplayForm } from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "./commonTypes";
import { VisualizationClass } from "@gooddata/gd-bear-model";
import { convertVisualizationClass } from "./toSdkModel/VisualizationClassConverter";
import { convertVisualization } from "./toSdkModel/VisualizationConverter";

export class BearWorkspaceMetadata implements IWorkspaceMetadata {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public getVisualizationClass = async (id: string): Promise<IVisualizationClass> => {
        const uri = await this.authCall(sdk => sdk.md.getObjectUri(this.workspace, id));
        const visClassResult = await this.authCall(
            sdk => sdk.md.getObjects(this.workspace, [uri]) as Promise<any>,
        );

        return convertVisualizationClass(visClassResult[0]);
    };

    public getVisualizationClasses = async (): Promise<IVisualizationClass[]> => {
        const visualizationClassesResult: VisualizationClass.IVisualizationClassWrapped[] = await this.authCall(
            sdk =>
                sdk.md.getObjectsByQuery(this.workspace, {
                    category: "visualizationClass",
                }),
        );

        return visualizationClassesResult.map(convertVisualizationClass);
    };

    public getInsight = async (id: string): Promise<IInsight> => {
        const uri = await this.authCall(sdk => sdk.md.getObjectUri(this.workspace, id));
        const visualization = await this.authCall(sdk => sdk.md.getVisualization(uri));

        const visClassResult: any[] = await this.authCall(sdk =>
            sdk.md.getObjects(this.workspace, [
                visualization.visualizationObject.content.visualizationClass.uri,
            ]),
        );

        const visClass = visClassResult[0];
        const visualizationClassIdentifier = visClass.visualizationClass.meta.identifier;

        return convertVisualization(visualization, visualizationClassIdentifier);
    };

    public getAttributeDisplayForm = async (id: string): Promise<IAttributeDisplayForm> => {
        const displayFormUri = await this.authCall(sdk => sdk.md.getObjectUri(this.workspace, id));
        const displayFormDetails = await this.authCall(sdk => sdk.md.getObjectDetails(displayFormUri));

        return {
            attribute: {
                uri: displayFormDetails.attributeDisplayForm.content.formOf,
            },
            id: displayFormDetails.attributeDisplayForm.meta.identifier,
            title: displayFormDetails.attributeDisplayForm.meta.title,
        };
    };
}
