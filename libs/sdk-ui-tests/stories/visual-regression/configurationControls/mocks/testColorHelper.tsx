// (C) 2020 GoodData Corporation
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { IColorPalette } from "@gooddata/sdk-model";
import cloneDeep from "lodash/cloneDeep.js";

export function getLargePalette(): IColorPalette {
    const largePalette = cloneDeep(DefaultColorPalette);

    for (let i = 0; i < DefaultColorPalette.length; i++) {
        const itemClon = cloneDeep(DefaultColorPalette[i]);
        itemClon.guid = i + "_" + itemClon.guid;
        largePalette.push(itemClon);
    }

    return largePalette;
}
