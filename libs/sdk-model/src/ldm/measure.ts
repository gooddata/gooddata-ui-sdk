// (C) 2019-2020 GoodData Corporation
import { IAttributeElement } from "./attributeElement";
import { IMetadataObject } from "./metadata";

/**
 * Token representing part of parsed MAQL measure expression
 * e.g. "SELECT [/gdc/md/projectId/obj/6273] WHERE [/gdc/md/projectId/obj/6307] = [/gdc/md/projectId/obj/6307/elements?id=5703453]"
 * could be represented as:
 *  \[
 *      \{
 *          "type": "text",
 *          "value": "SELECT "
 *      \},
 *      \{
 *          "type": "metadataObject",
 *          "value": "/gdc/md/projectId/obj/6273",
 *          "meta": IObjectMeta,
 *      \},
 *      \{
 *          "type": "text",
 *          "value": " WHERE "
 *      \},
 *      \{
 *          "type": "metadataObject",
 *          "value": "/gdc/md/projectId/obj/6307",
 *          "meta": IObjectMeta
 *      \},
 *      \{
 *          "type": "text",
 *          "value": " = "
 *      \},
 *      \{
 *          "type": "attributeElement",
 *          "value": "/gdc/md/projectId/obj/6307/elements?id=5703453",
 *          "element": IAttributeElement
 *      \}
 *  \]
 *
 * @public
 */
export type IMeasureExpressionToken =
    | IObjectExpressionToken
    | IAttributeElementExpressionToken
    | ITextExpressionToken;

/**
 * @public
 */
export interface IObjectExpressionToken {
    type: "metadataObject";
    value: string;
    meta: IMetadataObject;
}

/**
 * @public
 */
export interface IAttributeElementExpressionToken {
    type: "attributeElement";
    value: string;
    element: IAttributeElement;
}

/**
 * @public
 */
export interface ITextExpressionToken {
    type: "text";
    value: string;
}
