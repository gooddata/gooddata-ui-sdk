// (C) 2019 GoodData Corporation
export function getAttributeElementIdFromAttributeElementUri(attributeElementUri: string) {
    const match = "/elements?id=";
    return attributeElementUri.slice(attributeElementUri.lastIndexOf(match) + match.length);
}
