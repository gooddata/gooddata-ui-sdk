// (C) 2007-2020 GoodData Corporation
import get from "lodash/get";
import set from "lodash/set";
import { MetadataModule } from "../metadata";

function getAttributeUris(displayForms: any[]) {
    return displayForms.map((displayForm: any) =>
        get(displayForm, ["attributeDisplayForm", "content", "formOf"]),
    );
}

function createAttributesMap(displayForms: any[], attributes: any) {
    return displayForms.reduce((attributesMap: any, displayForm: any) => {
        const dfUri = get(displayForm, ["attributeDisplayForm", "meta", "uri"]);
        const attribute = attributes.find(
            (attr: any) =>
                get(attr, ["attribute", "meta", "uri"]) ===
                get(displayForm, ["attributeDisplayForm", "content", "formOf"]),
        );

        return set(attributesMap, [dfUri], attribute);
    }, {});
}

export function getMissingUrisInAttributesMap(
    displayFormsUris: string[],
    attributesMap: Record<string, unknown>,
): string[] {
    const uris = displayFormsUris || [];
    return uris.filter((uri: string) => !attributesMap[uri]);
}

export class AttributesMapLoaderModule {
    constructor(private md: MetadataModule) {}

    public loadAttributesMap(
        projectId: string,
        attributeDisplayFormUris: string[],
    ): Promise<Record<string, unknown>> {
        if (attributeDisplayFormUris.length === 0) {
            return Promise.resolve({});
        }

        return this.md.getObjects(projectId, attributeDisplayFormUris).then((displayForms: any[]) => {
            const attributeUris = getAttributeUris(displayForms);
            return this.md.getObjects(projectId, attributeUris).then((attributes: any[]) => {
                return createAttributesMap(displayForms, attributes);
            });
        });
    }
}
