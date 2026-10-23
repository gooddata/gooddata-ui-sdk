// (C) 2021-2026 GoodData Corporation

export enum MaqlType {
    /** Top type (supertype of all types) */
    ANY,
    /** Abstract granularity type */
    GRANULARITY,
    PERIODICAL_GRANULARITY,
    CHRONOLOGICAL_GRANULARITY,
    /** Abstract numeric type - facts, numbers, null */
    NUMERIC,
    /** Abstract string type - labels, strings, null */
    STRING,
    /** Abstract date type - date labels, date strings, null */
    DATE,
    /** Intersection of string and date, can be used as both */
    STRING_AND_DATE,
    NUMERIC_LITERAL,
    INTEGER_LITERAL,
    STRING_LITERAL,
    NULL_LITERAL,
    DATASET,
    BOOLEAN,
    /** Unit type - used for statements */
    UNIT,
    /** Bottom type (subtype of all types) - used for unresolvable nodes */
    ALL,
}

/**
 * Types representing values, such as numbers, texts, timestamps etc.
 */
export const abstractValueTypes = [MaqlType.NUMERIC, MaqlType.STRING, MaqlType.DATE] as const;

/**
 * Direct supertypes of a type. `MaqlType.ANY` is always implicitly a supertype.
 * All types are implicitly supertypes of `MaqlType.ALL`
 */
const supertypes: Record<MaqlType, MaqlType[]> = {
    [MaqlType.ANY]: [],
    [MaqlType.GRANULARITY]: [],
    [MaqlType.NUMERIC]: [],
    [MaqlType.STRING]: [],
    [MaqlType.DATE]: [],
    [MaqlType.STRING_AND_DATE]: [MaqlType.STRING, MaqlType.DATE],
    [MaqlType.DATASET]: [],
    [MaqlType.PERIODICAL_GRANULARITY]: [MaqlType.GRANULARITY],
    [MaqlType.CHRONOLOGICAL_GRANULARITY]: [MaqlType.GRANULARITY],
    [MaqlType.NUMERIC_LITERAL]: [MaqlType.NUMERIC],
    [MaqlType.INTEGER_LITERAL]: [MaqlType.NUMERIC_LITERAL],
    [MaqlType.STRING_LITERAL]: [MaqlType.STRING_AND_DATE],
    [MaqlType.NULL_LITERAL]: [MaqlType.NUMERIC, MaqlType.STRING_AND_DATE],
    [MaqlType.BOOLEAN]: [],
    [MaqlType.UNIT]: [],
    [MaqlType.ALL]: [],
};

interface ITypeHierarchyNode {
    type: MaqlType;
    children: ITypeHierarchyNode[];
    depth: number;
}

/**
 * MAQL types placed in a tree structure, where a child node is a subtype of the parent
 */
const typeHierarchy: ITypeHierarchyNode = constructTypeHierarchy();

function constructTypeHierarchy(): ITypeHierarchyNode {
    const typeMap: Map<MaqlType, MaqlType[]> = new Map();
    Object.entries(supertypes).forEach(([type, supers]) => {
        const maqlType: MaqlType = parseInt(type) as MaqlType;
        // do not use MaqlType.ALL and MaqlType.ANY in hierarchy, as they have special-case handling
        if (supers.length === 0 && maqlType !== MaqlType.ANY && maqlType !== MaqlType.ALL) {
            const children = typeMap.get(MaqlType.ANY) ?? [];
            children.push(maqlType);
            typeMap.set(MaqlType.ANY, children);
        } else {
            supers.forEach((sup) => {
                const children = typeMap.get(sup) ?? [];
                children.push(maqlType);
                typeMap.set(sup, children);
            });
        }
    });
    return typeHierarchyNode(MaqlType.ANY, typeMap);
}

function typeHierarchyNode(
    type: MaqlType,
    typeMap: Map<MaqlType, MaqlType[]>,
    depth = 0,
): ITypeHierarchyNode {
    const childTypes = typeMap.get(type) ?? [];
    return {
        type,
        children: childTypes.map((childType) => typeHierarchyNode(childType, typeMap, depth + 1)),
        depth,
    };
}

const hierarchyPath: ITypeHierarchyNode[] = walk(typeHierarchy);

/**
 * Depth-first walk of the type hierarchy, which stores the path to the `path` argument. Includes repeated visits.
 */
function walk(node: ITypeHierarchyNode, path: ITypeHierarchyNode[] = []): ITypeHierarchyNode[] {
    path.push(node);
    for (const child of node.children) {
        walk(child, path);
        path.push(node);
    }
    return path;
}

interface IRanges {
    index?: number;
    type?: MaqlType;
    ranges: [number, number][];
}

function handleSpecialCases(t1: MaqlType, t2: MaqlType): MaqlType | null {
    if (t1 === MaqlType.ANY || t2 === MaqlType.ANY) {
        return MaqlType.ANY;
    }
    if (t1 === t2 || t2 === MaqlType.ALL) {
        return t1;
    }
    if (t1 === MaqlType.ALL) {
        return t2;
    }
    return null;
}

function updateRangesAccumulator(acc: IRanges, node: ITypeHierarchyNode, idx: number): void {
    const isNewRange = acc.type !== undefined && node.type !== acc.type;
    if (isNewRange) {
        acc.ranges.push([acc.index ?? 0, idx]);
    }
    acc.type = node.type;
    acc.index = idx;
}

// find the ranges between the occurrences of the types `t1` and `t2` on a DFS walk on the type hierarchy
function findRangesBetweenTypes(t1: MaqlType, t2: MaqlType): [number, number][] {
    const isTargetType = (type: MaqlType) => type === t1 || type === t2;
    return hierarchyPath.reduce(
        (acc: IRanges, node, idx) => {
            if (isTargetType(node.type)) {
                updateRangesAccumulator(acc, node, idx);
            }
            return acc;
        },
        { ranges: [] },
    ).ranges;
}

// for each range find a node in the hierarchy with the lowest depth - the roots of subtrees
function findSubtreeRoots(ranges: [number, number][]): ITypeHierarchyNode[] {
    return ranges.map(([start, end]) => {
        // get the slice of the path between the two indexes
        const pathRange = hierarchyPath.slice(start, end + 1);
        return pathRange.reduce((min, next) => (next.depth < min.depth ? next : min));
    });
}

// choose the deepest node from the roots - the lowest root that is ancestor to both `t1` and `t2`
function findDeepestNode(nodes: ITypeHierarchyNode[]): ITypeHierarchyNode {
    return nodes.reduce((max, next) => (next.depth > max.depth ? next : max));
}

/**
 * Solves the lowest common ancestor (LCA) problem on the MAQL type hierarchy tree for the types `t1` and `t2`
 * Complexity: O(n*b) where n = number of types, b = branching factor (average number of subtypes per type)
 */
export function lowestCommonAncestor(t1: MaqlType, t2: MaqlType): MaqlType {
    const specialCase = handleSpecialCases(t1, t2);
    if (specialCase !== null) {
        return specialCase;
    }
    const ranges = findRangesBetweenTypes(t1, t2);
    const subtreeRoots = findSubtreeRoots(ranges);
    const deepestAncestor = findDeepestNode(subtreeRoots);
    return deepestAncestor.type;
}

export function isSubtype(type: MaqlType, supertype: MaqlType): boolean {
    if (type === MaqlType.ALL) {
        // special case - MaqlType.ALL is implicitly subtype of every type
        return true;
    }
    return withSupertypes(type).includes(supertype);
}

function withSupertypes(type: MaqlType): MaqlType[] {
    const sups = supertypes[type].flatMap((supertype) => withSupertypes(supertype)) ?? [];
    return [type, ...(sups.length > 0 ? sups : [MaqlType.ANY])];
}
