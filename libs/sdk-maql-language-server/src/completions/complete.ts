// (C) 2021-2026 GoodData Corporation

import { type CandidateRule, type CandidatesCollection, CodeCompletionCore, type TokenList } from "antlr4-c3";
import { type Token } from "antlr4ts";
import {
    CompletionItem,
    CompletionItemKind,
    CompletionList,
    MarkupKind,
    Range,
    TextEdit,
} from "vscode-languageserver";

import MaqlPkg, { type IPosition } from "@gooddata/maql-antlr4ts";
const { MaqlLexer, MaqlParser, escapeString } = MaqlPkg;

import { type IParameterDefinition } from "@gooddata/sdk-model";

import { type LabelContext, findLabelContext } from "../labelElements.js";
import { toMaqlObjectType } from "../maqlObjectTypes.js";
import {
    type ITigerMetadataObject,
    type ITigerParameter,
    type LabelElementsFunc,
    type LdmObjects,
} from "../metadata/model.js";
import { parameterDefaultLabel, parameterTypeLabel } from "../metadata/parameters.js";
import { MaqlMetric } from "../parseMaql.js";
import { tokenRange } from "../tokenRanges.js";
import { MaqlType, isSubtype } from "../types/hierarchy.js";

import {
    type CompletionDescription,
    type ICompletionMaqlData,
    descriptions,
    ignoredTokens,
} from "./descriptions.js";
import { findContext, isFinal } from "./findContext.js";
import { adjustSortText } from "./sort.js";

const [tokenCompletions, ruleCompletions] = getTokenAndRuleCompletions(descriptions);

export async function resolve(
    item: CompletionItem,
    docs: (resolveTag: string) => Promise<string | undefined>,
): Promise<CompletionItem> {
    const data: ICompletionMaqlData = item.data;
    const doc = data?.resolveTag ? await docs(data.resolveTag) : undefined;
    if (doc) {
        item.documentation = {
            kind: MarkupKind.Markdown,
            value: doc,
        };
    }
    return item;
}

/**
 * Find completions using the antlr4-c3 module.
 * @param query - The MAQL query to be completed
 * @param offset - The offset of the caret in the text
 * @param ldmObjects - LDM objects to be offered, if undefined snippets are offered instead
 * @param labelElementsFunc - Function to get possible label elements (strings) for a given label and filter text
 */
export async function complete(
    query: string,
    offset: number = query.length,
    ldmObjects?: LdmObjects,
    labelElementsFunc?: LabelElementsFunc,
): Promise<CompletionList> {
    const metric = new MaqlMetric(query);
    const adjustedOffset = MaqlMetric.offset(offset);
    const lines = query.slice(0, offset).split("\n");
    const position: IPosition = {
        line: lines.length,
        character: lines[lines.length - 1].length,
    };
    const caretContext = findContext(metric, position, adjustedOffset);
    const { leftFinalToken, caretToken, rightFinalToken } = caretContext.tokens;
    // we do not wish to offer completions inside line comments
    if (caretToken.type === MaqlParser.Comment) {
        return CompletionList.create();
    }
    const candidates = collectCandidates(metric, caretToken.tokenIndex);
    // "safe replacement range", which can be replaced by anything
    const range = textEditRange(leftFinalToken, caretToken, rightFinalToken);
    // get label elements completions if one of the candidates is a STRING token
    let context: LabelContext | null = null; // findLabelContext function is expensive for larger queries, so we lazy-initialize context
    const getContext = (): LabelContext => context ?? (context = findLabelContext(metric, position));
    const labelElementsList =
        labelElementsFunc && candidates.tokens.get(MaqlParser.String)
            ? await completeLabelElements(
                  labelElementsFunc,
                  range,
                  tokenToString(caretToken, adjustedOffset),
                  getContext(),
              )
            : CompletionList.create();
    // skip non-string completions if caret is inside string
    const stringTokens = [MaqlParser.String, MaqlParser.UnterminatedString];
    if (stringTokens.includes(caretToken.type)) {
        return labelElementsList;
    }
    // static completion items from descriptions
    const expectedTypes = caretContext.expectedTypes;
    const staticCompletionList = completeFromCandidateTokens(candidates.tokens, range, expectedTypes);
    // completions from preferred rules (to disambiguate tokens)
    const ruleCompletionList = completeFromRules(candidates.rules, range, ldmObjects, expectedTypes);
    const completionList = [labelElementsList, staticCompletionList, ruleCompletionList].reduce(
        (accuList: CompletionList, currList: CompletionList): CompletionList => ({
            items: accuList.items.concat(currList.items),
            isIncomplete: accuList.isIncomplete || currList.isIncomplete,
        }),
    );
    return adjustSortText(completionList, caretContext);
}

async function completeLabelElements(
    labelElementsFunc: LabelElementsFunc,
    range: Range | undefined,
    typedText: string | undefined,
    context: LabelContext,
): Promise<CompletionList> {
    const labelElementResult = await labelElementsFunc(
        context.labels,
        context.strings.map((str) => str.string),
        { filter: typedText },
    );
    return CompletionList.create(
        labelElementResult.list.elements
            .map((element) =>
                element.title === null ? null : createStringCompletionItem(element.title, undefined, range),
            )
            .filter((item): item is CompletionItem => item !== null),
        labelElementResult.list.isIncomplete,
    );
}

function completeFromCandidateTokens(
    tokens: Map<number, TokenList>,
    range: Range | undefined,
    allowedTypes: MaqlType[],
): CompletionList {
    const items: CompletionItem[] = [];
    tokens.forEach((_, tokenId) => {
        const staticCompletions = tokenCompletions.get(tokenId) ?? [];
        if (staticCompletions.length === 0 && !ignoredTokens.has(tokenId)) {
            // completions for tokens that do not have a description - useful when testing MAQL changes
            staticCompletions.push(CompletionItem.create(getTokenName(tokenId)));
        }
        const typedStaticCompletions = staticCompletions.filter((item) => {
            const itemType = item.maqlType;
            return itemType === undefined || allowedTypes.some((type) => isSubtype(itemType, type));
        });
        typedStaticCompletions.forEach((item) => withTextEdit(item, range));
        // filter-out descriptions with inapplicable types when known
        items.push(...typedStaticCompletions);
    });
    return CompletionList.create(items, false);
}

function getTokenName(tokenId: number): string {
    const literalName = MaqlParser.VOCABULARY.getLiteralName(tokenId);
    if (literalName !== undefined) {
        return literalName.slice(1, literalName.length - 1).toUpperCase();
    }
    return MaqlParser.VOCABULARY.getDisplayName(tokenId);
}

/**
 * Rule completions are necessary when the tokens to be completed are ambiguous
 * An example in MAQL would be NEXT used after FOR and the NEXT time macro
 * `... WHERE {label/date.day} = NEXT(DAY)` vs. `... FOR NEXT({label/date.day})`
 * They are also used for logical data model objects (labels, facts, metrics),
 * because using the parser rules is more explicit than checking for type tokens.
 */
function completeFromRules(
    rules: Map<number, CandidateRule>,
    range: Range | undefined,
    ldmObjects: LdmObjects | undefined,
    allowedTypes: MaqlType[],
): CompletionList {
    const items: CompletionItem[] = [];
    rules.forEach((_, ruleId) => {
        if (ruleId === MaqlParser.RULE_attribute && ldmObjects && ldmObjects?.size >= 0) {
            const attributeItems = completeAttribute(ldmObjects, range, allowedTypes);
            items.push(...attributeItems);
        } else if (
            (ruleId === MaqlParser.RULE_numeric || ruleId === MaqlParser.RULE_fact) &&
            ldmObjects &&
            ldmObjects?.size >= 0
        ) {
            const numericItems = completeNumeric(ldmObjects, range, allowedTypes);
            items.push(...numericItems);
        } else if (ruleId === MaqlParser.RULE_parameter && ldmObjects) {
            const parameterItems = completeParameter(ldmObjects, range, allowedTypes);
            items.push(...parameterItems);
        } else {
            const ruleItems = ruleCompletions.get(ruleId) ?? [];
            const typedRuleItems = ruleItems.filter((item) => {
                const compType = item.maqlType;
                return compType === undefined || allowedTypes.some((type) => isSubtype(compType, type));
            });
            typedRuleItems.forEach((item) => withTextEdit(item, range));
            items.push(...typedRuleItems);
        }
    });
    return CompletionList.create(items, false);
}

function completeAttribute(
    ldmObjects: LdmObjects,
    range: Range | undefined,
    allowedTypes: MaqlType[],
): CompletionItem[] {
    const items = [];
    if (allowedTypes.some((type) => isSubtype(MaqlType.DATE, type))) {
        items.push(...ldmObjects.get("label", "date").map((obj) => createMetadataCompletionItem(obj, range)));
    }
    if (allowedTypes.some((type) => isSubtype(MaqlType.STRING, type))) {
        items.push(
            ...ldmObjects.get("label", "regular").map((obj) => createMetadataCompletionItem(obj, range)),
        );
        // A computed attribute buckets rows into string values, so it completes wherever a regular
        // label does - both in a metric and in another computed attribute's expression.
        items.push(
            ...ldmObjects.get("computedAttribute").map((obj) => createMetadataCompletionItem(obj, range)),
        );
    }
    if (allowedTypes.some((type) => isSubtype(MaqlType.DATASET, type))) {
        items.push(...ldmObjects.get("dataset").map((obj) => createMetadataCompletionItem(obj, range)));
    }
    return items;
}

function completeNumeric(
    ldmObjects: LdmObjects,
    range: Range | undefined,
    allowedTypes: MaqlType[],
): CompletionItem[] {
    const items = [];
    if (allowedTypes.some((type) => isSubtype(MaqlType.NUMERIC, type))) {
        items.push(...ldmObjects.get("fact").map((obj) => createMetadataCompletionItem(obj, range)));
    }
    items.push(...ldmObjects.get("metric").map((obj) => createMetadataCompletionItem(obj, range)));
    return items;
}

function completeParameter(
    ldmObjects: LdmObjects,
    range: Range | undefined,
    allowedTypes: MaqlType[],
): CompletionItem[] {
    return ldmObjects
        .get("parameter")
        .filter((parameter) =>
            allowedTypes.some((type) => isSubtype(parameterMaqlType(parameter.definition), type)),
        )
        .map((obj) => createParameterCompletionItem(obj, range));
}

function parameterMaqlType(definition: IParameterDefinition): MaqlType {
    switch (definition.type) {
        case "NUMBER":
            return MaqlType.NUMERIC;
        case "STRING":
            return MaqlType.STRING;
    }
}

function createParameterCompletionItem(parameter: ITigerParameter, range?: Range): CompletionItem {
    const item = createMetadataCompletionItem(parameter, range);
    return {
        ...item,
        labelDetails: { description: parameterTypeLabel(parameter.definition) },
        detail: `${item.detail}, Default: ${parameterDefaultLabel(parameter.definition)}`,
    };
}

// preferredRules specify rules where token ids alone are insufficient, because they are ambiguous
const preferredRules = new Set<number>([
    MaqlParser.RULE_attribute,
    MaqlParser.RULE_numeric,
    ...ruleCompletions.keys(),
]);

function collectCandidates(metric: MaqlMetric, caretTokenIndex: number): CandidatesCollection {
    const core = new CodeCompletionCore(metric.parser);
    core.translateRulesTopDown = true;
    core.preferredRules = preferredRules;
    return core.collectCandidates(caretTokenIndex);
}

const irreplaceableTokens = new Set([MaqlLexer.WS, MaqlLexer.LPAREN, MaqlLexer.RPAREN, MaqlLexer.COMMA]);

function textEditRange(lastValidToken: Token, caretToken: Token, nextValidToken: Token): Range | undefined {
    if (
        caretToken.channel !== MaqlLexer.DEFAULT_TOKEN_CHANNEL ||
        lastValidToken.tokenIndex > nextValidToken.tokenIndex ||
        irreplaceableTokens.has(caretToken.type)
    ) {
        return undefined;
    }
    if (lastValidToken === nextValidToken) {
        return tokenRange(lastValidToken);
    }
    const lastRange = tokenRange(lastValidToken);
    const nextRange = tokenRange(nextValidToken);
    return Range.create(
        lastRange.end.line,
        lastRange.end.character,
        nextRange.start.line,
        nextRange.start.character,
    );
}

function withTextEdit(item: CompletionItem, range?: Range): CompletionItem {
    item.textEdit = range ? TextEdit.replace(range, item.insertText ?? item.label) : undefined;
    return item;
}

function createMetadataCompletionItem(metadataObject: ITigerMetadataObject, range?: Range): CompletionItem {
    // The completion is inserted into MAQL text, so it has to use the MAQL spelling of the type
    // (`computed_attribute`), not the Tiger one (`computedAttribute`) the catalog object carries.
    const maqlType = toMaqlObjectType(metadataObject.tigerType);
    const identifier = `${maqlType}/${metadataObject.id}`;
    const insertText = `{${identifier}}`;
    const kind = getCompletionItemKind(metadataObject);
    return {
        label: metadataObject.title ?? identifier,
        kind: kind,
        insertText: insertText,
        filterText: `{ ${maqlType} / ${metadataObject.id} } ${metadataObject.title}`,
        // Sort by the bare id (no MAQL type prefix) so that object types sharing a completion kind
        // (labels and computed attributes) interleave instead of clustering by MAQL type.
        sortText: metadataObject.id,
        detail: `ID: '${identifier}', Description: '${metadataObject.description}'`,
        textEdit: range ? TextEdit.replace(range, insertText) : undefined,
    };
}

/**
 * A function to get text value of a token for the purposes of filtering completions
 * @param token - MAQL token from Antlr4 generated parser
 * @param offset - caret offset in the entire query
 */
function tokenToString(token: Token, offset: number): string | undefined {
    if (token.type === MaqlParser.UnterminatedString) {
        return token.text
            ?.slice(1, Math.min(token.text.length, offset - token.startIndex))
            .replace(/\\"/g, '"');
    } else if (token.type === MaqlParser.String) {
        return token.text
            ?.slice(1, Math.min(token.text.length - 1, offset - token.startIndex))
            .replace(/\\"/g, '"');
        // oxlint-disable-next-line eslint/no-negated-condition
    } else if (!isFinal(token)) {
        return token.text?.slice(0, Math.min(token.text.length, offset - token.startIndex));
    } else {
        return undefined; // final tokens must not be used - their text value is not useful
    }
}

function createStringCompletionItem(label: string, detail?: string, range?: Range): CompletionItem {
    const insertText = escapeString(label, '"');
    return {
        label: label,
        kind: CompletionItemKind.Text,
        insertText: insertText,
        sortText: label,
        filterText: `" ${label} "`,
        detail: detail,
        textEdit: range ? TextEdit.replace(range, insertText) : undefined,
    };
}

function getCompletionItemKind(metadataObject: ITigerMetadataObject): CompletionItemKind {
    switch (metadataObject.tigerType) {
        case "fact":
            return CompletionItemKind.Field;
        case "metric":
            return CompletionItemKind.Variable;
        case "dataset":
            return CompletionItemKind.Constant;
        case "parameter":
            return CompletionItemKind.Value;
        case "label":
        case "attribute":
        case "computedAttribute":
            return CompletionItemKind.Enum;
        default:
            return CompletionItemKind.Variable;
    }
}

/**
 * @returns [Map\<token id, CompletionDescription[]\>, Map\<rule id, CompletionDescription[]\>]
 */
function getTokenAndRuleCompletions(
    descriptions: CompletionDescription[],
): [
    tokenDescriptions: Map<number, CompletionDescription[]>,
    ruleDescriptions: Map<number, CompletionDescription[]>,
] {
    const tokenDescriptions = new Map<number, CompletionDescription[]>();
    const ruleDescriptions = new Map<number, CompletionDescription[]>();
    descriptions.forEach((desc) => {
        if (desc.ruleId) {
            const list = ruleDescriptions.get(desc.ruleId) ?? [];
            list.push(desc);
            ruleDescriptions.set(desc.ruleId, list);
        } else if (desc.triggerTokenId) {
            const list = tokenDescriptions.get(desc.triggerTokenId) ?? [];
            list.push(desc);
            tokenDescriptions.set(desc.triggerTokenId, list);
        } else {
            throw new Error(
                `completion description for '${desc.label}' has neither triggerTokenId nor ruleId!`,
            );
        }
        (desc.data as ICompletionMaqlData) = {
            resolveTag: desc.resolveTag,
            ruleId: desc.ruleId,
            triggerTokenId: desc.triggerTokenId,
        }; // store additional info tag in 'data' property for retrieval on completion resolve
    });
    return [tokenDescriptions, ruleDescriptions];
}
