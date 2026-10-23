// (C) 2023-2026 GoodData Corporation

export function getType(typeList: string[], current: string) {
    return typeList.indexOf(current);
}

export function getModifiers(modifiersList: string[], current: string[]): number {
    const bitArray = modifiersList
        .map((item) => {
            return current.includes(item) ? 1 : 0;
        })
        .reverse();

    return bitArray.reduce((acc, val) => {
        return (acc << 1) | val;
    }, 0 as number);
}
