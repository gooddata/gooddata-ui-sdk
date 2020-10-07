// (C) 2019-2020 GoodData Corporation
import { IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import { IColorPaletteItem } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types";
import { DefaultColorPalette } from "./mocks/colorPalette";

export class TigerWorkspaceStyling implements IWorkspaceStylingService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        return this.authCall(async () => DefaultColorPalette);
    };
}
