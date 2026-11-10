// (C) 2020-2026 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { _cloneDeep } from "@gooddata/util";

export function getLargePalette(): IColorPalette {
    const largePalette = _cloneDeep(DefaultColorPalette);

    for (let i = 0; i < DefaultColorPalette.length; i++) {
        const itemClon = _cloneDeep(DefaultColorPalette[i]);
        itemClon.guid = i + "_" + itemClon.guid;
        largePalette.push(itemClon);
    }

    return largePalette;
}
