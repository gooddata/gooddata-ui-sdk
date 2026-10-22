// (C) 2026 GoodData Corporation

/**
 * Read guide Props from the api-extractor model (*.api.json) — the same pruned
 * snapshot generate-reference.ts feeds to api-documenter. One input for both
 * the API reference and the guide Props tables, so the two cannot drift, and
 * every type token carries the canonicalReference that links it to its
 * reference page.
 */
import { isDeprecated, summaryFromDocComment } from "./tsdoc.js";

export interface ExcerptToken {
    kind: "Content" | "Reference";
    text: string;
    canonicalReference?: string;
}

export interface TokenRange {
    startIndex: number;
    endIndex: number;
}

export interface ApiItem {
    kind: string;
    canonicalReference: string;
    name: string;
    docComment?: string;
    excerptTokens?: ExcerptToken[];
    members?: ApiItem[];
    extendsTokenRanges?: TokenRange[];
    parameters?: { parameterName: string; parameterTypeTokenRange: TokenRange; isOptional: boolean }[];
    propertyTypeTokenRange?: TokenRange;
    variableTypeTokenRange?: TokenRange;
    isOptional?: boolean;
    releaseTag?: string;
    overloadIndex?: number;
}

export interface ApiPackageJson {
    kind: "Package";
    name: string;
    members: ApiItem[];
}

/** A piece of a rendered type: `ref` is the canonicalReference of a Reference token. */
export interface TypeToken {
    text: string;
    ref?: string;
}

export interface ModelProp {
    name: string;
    type: TypeToken[];
    required: boolean;
    description: string;
    deprecated: boolean;
    /** The member is @beta. */
    beta: boolean;
    /** The member is @alpha. */
    alpha: boolean;
    /** Interface that declares the member. */
    owner: string;
    /** Its canonicalReference without the kind suffix, e.g. `@gooddata/sdk-ui-charts!IBarChartBucketProps`. */
    ownerRef: string;
    /** `owner` is not the interface the table was resolved for. */
    inherited: boolean;
}

export interface ApiModel {
    /** `@gooddata/<pkg>!<Name>` -> declarations (overloads share the key). */
    byRef: Map<string, ApiItem[]>;
    /** Bare name -> declarations across packages. */
    byName: Map<string, ApiItem[]>;
}

const SYMBOL_FORMAT = /^@gooddata\/([a-z0-9-]+):(.+)$/;
const REF_FORMAT = /^@gooddata\/([a-z0-9-]+)!([^:#~]+)/;

/** `@gooddata/pkg!Name:function(1)` -> `@gooddata/pkg!Name`. */
export function refKey(canonicalReference: string): string {
    return canonicalReference.replace(/:[a-z]+(\(\d+\))?$/, "");
}

/** `@gooddata/sdk-ui!Foo:type` -> `sdk-ui.foo` (api_refs.json key); undefined outside @gooddata. */
export function refToSlug(canonicalReference: string): string | undefined {
    const m = REF_FORMAT.exec(canonicalReference);
    if (!m) return undefined;
    return `${m[1]}.${m[2].toLowerCase()}`;
}

/** `@gooddata/pkg:Name` (guide api_symbols) -> `@gooddata/pkg!Name` (model key). */
export function symbolToRefKey(symbol: string): string | undefined {
    const m = SYMBOL_FORMAT.exec(symbol.trim());
    if (!m) return undefined;
    return `@gooddata/${m[1]}!${m[2]}`;
}

export function loadApiModelFromDocs(docs: ApiPackageJson[]): ApiModel {
    const byRef = new Map<string, ApiItem[]>();
    const byName = new Map<string, ApiItem[]>();
    for (const doc of docs) {
        for (const entryPoint of doc.members ?? []) {
            for (const item of entryPoint.members ?? []) {
                const key = refKey(item.canonicalReference);
                byRef.set(key, [...(byRef.get(key) ?? []), item]);
                byName.set(item.name, [...(byName.get(item.name) ?? []), item]);
            }
        }
    }
    return { byRef, byName };
}

function tokensInRange(item: ApiItem, range: TokenRange | undefined): ExcerptToken[] {
    if (!range || !item.excerptTokens) return [];
    return item.excerptTokens.slice(range.startIndex, range.endIndex);
}

function findInterface(model: ApiModel, canonicalReference: string): ApiItem | undefined {
    return model.byRef.get(refKey(canonicalReference))?.find((i) => i.kind === "Interface");
}

function firstInterfaceRef(model: ApiModel, tokens: ExcerptToken[]): ApiItem | undefined {
    for (const t of tokens) {
        if (t.kind !== "Reference" || !t.canonicalReference) continue;
        const iface = findInterface(model, t.canonicalReference);
        if (iface) return iface;
    }
    return undefined;
}

/**
 * The props interface an `api_symbols` entry documents: an Interface is its own;
 * a Function takes its first parameter's type; a Variable (`const X: FC<IProps>`)
 * or Class (`extends Component<IProps>`) takes the first interface referenced in
 * its declaration.
 *
 * A component that destructures its props (`function X({ a, b }: IProps)`) gets
 * an extra leading parameter named after the pattern, with an empty type range,
 * before the `input: IProps` that api-extractor actually emits — so the first
 * parameter with a type is the one that counts.
 *
 * A parameter typed as an inline object (`input: { execution: IPreparedExecution }`)
 * has no props interface; the first interface it mentions is a prop's type, not
 * the props, so it resolves to nothing.
 */
export function findPropsInterface(model: ApiModel, item: ApiItem): ApiItem | undefined {
    if (item.kind === "Interface") return item;
    if (item.kind === "Function") {
        const param = item.parameters?.find(
            (p) => p.parameterTypeTokenRange.endIndex > p.parameterTypeTokenRange.startIndex,
        );
        const tokens = tokensInRange(item, param?.parameterTypeTokenRange);
        if (tokens[0]?.text.trimStart().startsWith("{")) return undefined;
        return firstInterfaceRef(model, tokens);
    }
    return firstInterfaceRef(model, item.excerptTokens ?? []);
}

function toTypeTokens(tokens: ExcerptToken[]): TypeToken[] {
    return tokens.map((t) =>
        t.kind === "Reference" && t.canonicalReference
            ? { text: t.text, ref: t.canonicalReference }
            : { text: t.text },
    );
}

/**
 * `onDrill?(event: IDrillEvent): void;` -> tokens spelling `(event: IDrillEvent) => void`.
 * The `): ` that closes the parameter list is found at paren depth 0 so nested
 * function-typed parameters are left alone.
 */
function methodTypeTokens(member: ApiItem): TypeToken[] {
    const tokens = toTypeTokens(member.excerptTokens ?? []).map((t) => ({ ...t }));
    if (!tokens.length) return tokens;
    tokens[0].text = tokens[0].text.replace(new RegExp(`^${escapeRegExp(member.name)}\\??`), "");
    tokens[tokens.length - 1].text = tokens[tokens.length - 1].text.replace(/;\s*$/, "");
    let depth = 0;
    outer: for (const t of tokens) {
        if (t.ref) continue;
        for (let i = 0; i < t.text.length; i++) {
            const ch = t.text[i];
            if (ch === "(" || ch === "<" || ch === "[" || ch === "{") depth++;
            else if (ch === ")" || ch === ">" || ch === "]" || ch === "}") {
                depth--;
                if (depth === 0 && ch === ")" && t.text.startsWith(": ", i + 1)) {
                    t.text = `${t.text.slice(0, i + 1)} => ${t.text.slice(i + 3)}`;
                    break outer;
                }
            }
        }
    }
    return tokens;
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function memberToProp(member: ApiItem, owner: ApiItem, inherited: boolean): ModelProp | undefined {
    let type: TypeToken[];
    if (member.kind === "PropertySignature") {
        type = toTypeTokens(tokensInRange(member, member.propertyTypeTokenRange));
    } else if (member.kind === "MethodSignature") {
        type = methodTypeTokens(member);
    } else {
        return undefined; // IndexSignature, CallSignature, …
    }
    return {
        name: member.name,
        type,
        required: !member.isOptional,
        description: summaryFromDocComment(member.docComment),
        deprecated: isDeprecated(member.docComment),
        beta: member.releaseTag === "Beta",
        alpha: member.releaseTag === "Alpha",
        owner: owner.name,
        ownerRef: refKey(owner.canonicalReference),
        inherited,
    };
}

/**
 * Own + inherited members of `iface`. Own members shadow inherited ones of the
 * same name; nearer ancestors shadow farther ones. Parents outside the model
 * (React types, pruned packages) are skipped; cycles are guarded.
 */
export function collectProps(model: ApiModel, iface: ApiItem): ModelProp[] {
    const seen = new Map<string, ModelProp>();
    const visited = new Set<string>();

    const walk = (item: ApiItem) => {
        const key = refKey(item.canonicalReference);
        if (visited.has(key)) return;
        visited.add(key);
        for (const member of item.members ?? []) {
            if (seen.has(member.name)) continue;
            const prop = memberToProp(member, item, item !== iface);
            if (prop) seen.set(prop.name, prop);
        }
        for (const range of item.extendsTokenRanges ?? []) {
            for (const t of tokensInRange(item, range)) {
                if (t.kind !== "Reference" || !t.canonicalReference) continue;
                const parent = findInterface(model, t.canonicalReference);
                if (parent) walk(parent);
            }
        }
    };

    walk(iface);
    return [...seen.values()];
}

/**
 * Resolve a guide page's props from `api_symbols` (in order; first candidate
 * yielding at least one prop wins). `props_interfaces` is consulted only when
 * the page declares no `api_symbols` at all: a page whose declared symbols are
 * not public (e.g. a @beta component) must keep its existing table rather than
 * silently get the table of some public ancestor listed in props_interfaces.
 */
export function resolvePropsForPage(
    model: ApiModel,
    apiSymbols: string[],
    propsInterfaces: string[],
): { root: ApiItem; props: ModelProp[] } | undefined {
    const candidates: ApiItem[] = [];
    for (const symbol of apiSymbols) {
        const key = symbolToRefKey(symbol);
        if (key) candidates.push(...(model.byRef.get(key) ?? []));
    }
    if (!apiSymbols.length) {
        for (const name of propsInterfaces) {
            candidates.push(...(model.byName.get(name) ?? []).filter((i) => i.kind === "Interface"));
        }
    }
    for (const candidate of candidates) {
        const root = findPropsInterface(model, candidate);
        if (!root) continue;
        const props = collectProps(model, root);
        if (props.length) return { root, props };
    }
    return undefined;
}
