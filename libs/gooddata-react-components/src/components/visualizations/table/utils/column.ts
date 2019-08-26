// (C) 2007-2018 GoodData Corporation
import { isMappingHeaderMeasureItem, IMappingHeader } from "../../../../interfaces/MappingHeader";
import { Align } from "../../../../interfaces/Table";
import { ALIGN_LEFT, ALIGN_RIGHT } from "../constants/align";

export function getColumnAlign(header: IMappingHeader): Align {
    return isMappingHeaderMeasureItem(header) ? ALIGN_RIGHT : ALIGN_LEFT;
}
