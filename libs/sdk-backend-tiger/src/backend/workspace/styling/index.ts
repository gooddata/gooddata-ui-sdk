// (C) 2019-2020 GoodData Corporation
import { IWorkspaceStylingService, ITheme } from "@gooddata/sdk-backend-spi";
import { IColorPaletteItem } from "@gooddata/sdk-model";

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
