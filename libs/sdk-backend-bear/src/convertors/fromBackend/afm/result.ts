// (C) 2020 GoodData Corporation
import { IResultHeader } from "@gooddata/sdk-backend-spi";
import { IPostProcessing } from "@gooddata/sdk-model";
import { transformDateFormat } from "../../dateFormatting/dateFormatter";
import { DateFormat } from "../../dateFormatting/dateValueParser";

export function transformResultHeader(
    resultHeader: IResultHeader,
    postProcessing?: IPostProcessing,
): IResultHeader {
    return transformDateFormat(resultHeader, postProcessing?.dateFormat as DateFormat);
}
