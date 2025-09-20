// (C) 2020-2025 GoodData Corporation
import { cloneDeep } from "lodash-es";

import { IColorPalette } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";

export function getLargePalette(): IColorPalette {
    const largePalette = cloneDeep(DefaultColorPalette);

    for (let i = 0; i < DefaultColorPalette.length; i++) {
        const itemClon = cloneDeep(DefaultColorPalette[i]);
        itemClon.guid = i + "_" + itemClon.guid;
        largePalette.push(itemClon);
    }

    return largePalette;
}
