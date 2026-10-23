// (C) 2007-2026 GoodData Corporation

import {
    type IAnalyticalBackend,
    type IAttributeElementExpressionToken,
    type IBracketExpressionToken,
    type ICommentExpressionToken,
    type IMeasureExpressionToken,
    type IObjectExpressionToken,
    type ITextExpressionToken,
} from "@gooddata/sdk-backend-spi";
import { type ObjRef } from "@gooddata/sdk-model";

const TypeMapping = {
    measure: "metric",
    label: "attribute",
} as const;

export interface IExpressionToken {
    id?: string;
    ref?: ObjRef;
    title: string;
    deleted?: boolean;
    empty?: boolean;
    category?: (typeof TypeMapping)[keyof typeof TypeMapping] | IMeasureExpressionToken["type"];
}

export async function getMeasureExpressionTokens(
    backend: IAnalyticalBackend,
    projectId: string,
    ref: ObjRef,
): Promise<ReadonlyArray<IExpressionToken>> {
    const tokens = await backend.workspace(projectId).measures().getMeasureExpressionTokens(ref);
    return tokens.map(mapToken);
}

export function transformTokensForMaqlRenderer(tokens: IMeasureExpressionToken[]): IExpressionToken[] {
    return tokens.map(mapToken);
}

function mapToken(token: IMeasureExpressionToken): IExpressionToken {
    switch (token.type) {
        case "attributeElement":
            return createAttribute(token);
        case "attributeHierarchy":
        case "user":
        case "userGroup":
        case "dateHierarchyTemplate":
        case "dateAttributeHierarchy":
        case "variable":
        case "measure":
        case "filterContext":
        case "displayForm":
        case "tag":
        case "insight":
        case "dashboardPlugin":
        case "attribute":
        case "computedAttribute":
        case "analyticalDashboard":
        case "dataSet":
        case "fact":
        case "theme":
        case "colorPalette":
        case "workspaceTheme":
        case "workspaceColorPalette":
        case "exportDefinition":
        case "automation":
        case "filterView":
        case "workspaceDataFilter":
        case "workspaceDataFilterSetting":
        case "notificationChannel":
        case "memoryItem":
        case "userDataFilter":
        case "parameter":
        case "reportPageLayout":
        case "reportTemplate":
        case "report":
        case "document":
        case "documentTemplate":
        case "pageTemplate":
            return createObject(token);
        case "text":
        case "number":
        case "quoted_text":
        case "bracket":
        case "comment":
            return createText(token);
    }
}

function createAttribute(token: IAttributeElementExpressionToken): IExpressionToken {
    return {
        deleted: token.deleted,
        empty: Boolean(token.value),
        title: token.value || "",
        category: token.type,
    };
}

function createText(
    token: ITextExpressionToken | ICommentExpressionToken | IBracketExpressionToken,
): IExpressionToken {
    return {
        title: token.value,
        category: token.type,
    };
}

function createObject(token: IObjectExpressionToken): IExpressionToken {
    return {
        title: token.value,
        category: TypeMapping[token.type as keyof typeof TypeMapping] || token.type,
        id: token.id,
        ref: token.ref,
    };
}
