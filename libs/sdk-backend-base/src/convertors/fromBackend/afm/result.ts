// (C) 2020-2022 GoodData Corporation
import { IPostProcessing, IResultHeader } from "@gooddata/sdk-model";

/**
 * @public
 */
export type ResultHeaderTransformer = (
    resultHeader: IResultHeader,
    postProcessing?: IPostProcessing,
) => IResultHeader;

/**
 * Transforms the result headers in an AFM execution result.
 *
 * @param resultHeaders - Execution result headers to be transformed.
 * @param resultHeaderTransformer - The transformation function to be called to transform each result header.
 * @param postProcessing - Contains any configuration that should be used during transformation.
 * @returns The transformed result headers if resultHeaderTransformer has a value,
 *  or resultHeaders is returned if resultHeaderTransformer does not have any value.
 *
 * @public
 */
export function transformResultHeaders(
    resultHeaders: IResultHeader[][][],
    resultHeaderTransformer?: ResultHeaderTransformer,
    postProcessing?: IPostProcessing,
): IResultHeader[][][] {
    if (!resultHeaderTransformer) {
        return resultHeaders;
    }
    return resultHeaders.map((resultHeaders1: IResultHeader[][]) => {
        return resultHeaders1.map((resultHeaders2: IResultHeader[]) => {
            return resultHeaders2.map((resultHeader: IResultHeader) => {
                return resultHeaderTransformer(resultHeader, postProcessing);
            });
        });
    });
}
