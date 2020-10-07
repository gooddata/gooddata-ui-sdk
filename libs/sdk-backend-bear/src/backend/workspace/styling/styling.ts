// (C) 2019-2020 GoodData Corporation
import { IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import { IColorPaletteItem } from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types/auth";

export class BearWorkspaceStyling implements IWorkspaceStylingService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        const palette = await this.authCall((sdk) => sdk.project.getColorPaletteWithGuids(this.workspace));
        return palette || [];
    };
}
