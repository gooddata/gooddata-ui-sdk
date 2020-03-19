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
 * Parsed maql token referencing metadata object
 *
 * @public
 */
export interface IObjectExpressionToken {
    /**
     * Expression token type
     */
    type: "metadataObject";

    /**
     * Parsed maql value, in this case it's metadata object uri
     */
    value: string;

    /**
     * Referenced metadata object
     */
    meta: IMetadataObject;
}

/**
 * Parsed maql token referencing attribute element
 *
 * @public
 */
export interface IAttributeElementExpressionToken {
    /**
     * Expression token type
     */
    type: "attributeElement";

    /**
     * Parsed maql value, in this case it's attribute element uri
     */
    value: string;

    /**
     * Referenced attribute element
     */
    element: IAttributeElement;
}

/**
 * Parsed maql text value
 *
 * @public
 */
export interface ITextExpressionToken {
    /**
     * Expression token type
     */
    type: "text";

    /**
     * Parsed maql text value
     */
    value: string;
}
