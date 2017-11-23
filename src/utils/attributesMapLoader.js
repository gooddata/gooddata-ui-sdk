import {
    get,
    set
} from 'lodash';

import {
    getObjects
} from '../metadata';

function getAttributeUris(displayForms) {
    return displayForms.map(
        displayForm => get(displayForm, ['attributeDisplayForm', 'content', 'formOf'])
    );
}

function createAttributesMap(displayForms, attributes) {
    return displayForms.reduce((attributesMap, displayForm) => {
        const dfUri = get(displayForm, ['attributeDisplayForm', 'meta', 'uri']);
        const attribute = attributes.find(attr =>
            get(attr, ['attribute', 'meta', 'uri']) === get(displayForm, ['attributeDisplayForm', 'content', 'formOf'])
        );

        return set(attributesMap, [dfUri], attribute);
    },
    {});
}

export function loadAttributesMap(projectId, attributeDisplayFormUris) {
    if (attributeDisplayFormUris.length === 0) {
        return Promise.resolve({});
    }

    return getObjects(projectId, attributeDisplayFormUris).then((displayForms) => {
        const attributeUris = getAttributeUris(displayForms);
        return getObjects(projectId, attributeUris).then((attributes) => {
            return createAttributesMap(displayForms, attributes);
        });
    });
}
