// (C) 2019-2022 GoodData Corporation
import { IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import { IColorPaletteItem, ITheme } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types";
import { DefaultColorPalette } from "./mocks/colorPalette";
import { DefaultTheme } from "./mocks/theme";

export class TigerWorkspaceStyling implements IWorkspaceStylingService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        return this.authCall(async () => DefaultColorPalette);
    };

    public getTheme = async (): Promise<ITheme> => {
        return this.authCall(async () => DefaultTheme);
    };
}
