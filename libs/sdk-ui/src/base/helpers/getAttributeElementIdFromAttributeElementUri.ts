export function getAttributeElementIdFromAttributeElementUri(attributeElementUri: string) {
    const match = "/elements?id=";
    return attributeElementUri.slice(attributeElementUri.lastIndexOf(match) + match.length);
}
