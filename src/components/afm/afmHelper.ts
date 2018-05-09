import { get } from 'lodash';

import { AFM } from '@gooddata/typings';

export const generateDefaultDimensions = function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: ['measureGroup']
        },
        {
            itemIdentifiers: get(afm, 'attributes', []).map(a => a.localIdentifier)
        }
    ];
};
