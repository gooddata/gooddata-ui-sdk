// (C) 2007-2018 GoodData Corporation
import {
    Align,
    isMeasureTableHeader,
    TableHeader
} from '../../../../interfaces/Table';

import { ALIGN_LEFT, ALIGN_RIGHT } from '../constants/align';

export function getColumnAlign(header: TableHeader): Align {
    return isMeasureTableHeader(header) ? ALIGN_RIGHT : ALIGN_LEFT;
}
