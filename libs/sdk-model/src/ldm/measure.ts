// (C) 2019-2020 GoodData Corporation
import { ObjectType } from "../objRef";

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
 *          "type": "measure",
 *          "value": "Amount",
 *      \},
 *      \{
 *          "type": "text",
 *          "value": " WHERE "
 *      \},
 *      \{
 *          "type": "attribute",
 *          "value": "Status",
 *      \},
 *      \{
 *          "type": "text",
 *          "value": " = "
 *      \},
 *      \{
 *          "type": "attributeElement",
 *          "value": "Won",
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
    type: ObjectType;

    /**
     * Title of the object
     */
    value: string;
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
     * Element title
     */
    value: string | undefined;

    /**
     * Deleted element
     */
    deleted?: boolean;
}

/**
 * Parsed maql text
 *
 * @public
 */
export interface ITextExpressionToken {
    /**
     * Expression token type
     */
    type: "text";

    /**
     * Plain text
     */
    value: string;
}
