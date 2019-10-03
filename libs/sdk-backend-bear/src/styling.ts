// (C) 2019 GoodData Corporation
import { IColorPaletteItem } from "@gooddata/sdk-model";
import { IWorkspaceStyling } from "@gooddata/sdk-backend-spi";
import { AuthenticatedSdkProvider } from "./commonTypes";

export class BearWorkspaceStyling implements IWorkspaceStyling {
    constructor(private readonly authSdk: AuthenticatedSdkProvider, public readonly workspace: string) {}

    public colorPalette = async (): Promise<IColorPaletteItem[]> => {
        const sdk = await this.authSdk();
        const palette = await sdk.project.getColorPaletteWithGuids(this.workspace);
        return palette || [];
    };
}
