// (C) 2007-2020 GoodData Corporation
import { IWrappedAttribute, IWrappedAttributeDisplayForm } from "@gooddata/api-model-bear";
import { MetadataModule } from "../metadata.js";

function getAttributeUris(displayForms: IWrappedAttributeDisplayForm[]) {
    return displayForms.map((displayForm) => displayForm.attributeDisplayForm.content.formOf);
}

function createAttributesMap(
    displayForms: IWrappedAttributeDisplayForm[],
    attributes: IWrappedAttribute[],
): Record<string, IWrappedAttribute> {
    return displayForms.reduce((attributesMap: Record<string, IWrappedAttribute>, displayForm) => {
        const dfUri = displayForm.attributeDisplayForm.meta.uri!;
        const attribute = attributes.find(
            (attr) => attr.attribute.meta.uri === displayForm.attributeDisplayForm.content.formOf,
        );
        attributesMap[dfUri] = attribute!;
        return attributesMap;
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

        return this.md
            .getObjects<IWrappedAttributeDisplayForm>(projectId, attributeDisplayFormUris)
            .then((displayForms) => {
                const attributeUris = getAttributeUris(displayForms);
                return this.md.getObjects<IWrappedAttribute>(projectId, attributeUris).then((attributes) => {
                    return createAttributesMap(displayForms, attributes);
                });
            });
    }
}
