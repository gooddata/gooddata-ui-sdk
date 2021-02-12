// (C) 2020-2021 GoodData Corporation
import { ResultHeaderTransformer } from "@gooddata/sdk-backend-base";
import { IResultHeader } from "@gooddata/sdk-backend-spi";
import { IPostProcessing } from "@gooddata/sdk-model";
import { transformDateFormat } from "../../dateFormatting/dateFormatter";
import { DateFormat } from "../../dateFormatting/dateValueParser";

export function createResultHeaderTransformer(dateAttributeUris?: string[]): ResultHeaderTransformer {
    return (resultHeader: IResultHeader, postProcessing?: IPostProcessing): IResultHeader => {
        return transformDateFormat(resultHeader, dateAttributeUris, postProcessing?.dateFormat as DateFormat);
    };
}
