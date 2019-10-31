// (C) 2019 GoodData Corporation
import { IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import { IColorPaletteItem } from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "./commonTypes";

export class BearWorkspaceStyling implements IWorkspaceStylingService {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public colorPalette = async (): Promise<IColorPaletteItem[]> => {
        const palette = await this.authCall(sdk => sdk.project.getColorPaletteWithGuids(this.workspace));
        return palette || [];
    };
}
