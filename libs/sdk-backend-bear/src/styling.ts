// (C) 2019 GoodData Corporation
import { IWorkspaceStyling } from "@gooddata/sdk-backend-spi";
import { IColorPaletteItem } from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "./commonTypes";

export class BearWorkspaceStyling implements IWorkspaceStyling {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public colorPalette = async (): Promise<IColorPaletteItem[]> => {
        const palette = await this.authCall(sdk => sdk.project.getColorPaletteWithGuids(this.workspace));
        return palette || [];
    };
}
