import { get } from 'lodash';

import { AFM } from '@gooddata/typings';

// for LineChart, AreaChart, BarChart, ColumnChart
export const generateDefaultDimensions = (afm: AFM.IAfm): AFM.IDimension[] => {
    return [
        {
            itemIdentifiers: ['measureGroup']
        },
        {
            itemIdentifiers: get(afm, 'attributes', []).map(a => a.localIdentifier)
        }
    ];
};

// for PieChart, DonutChart
export const generateDefaultDimensionsForRoundChart = (afm: AFM.IAfm): AFM.IDimension[] => {
    if ((afm.attributes || []).length === 0) {
        return [
            {
                itemIdentifiers: []
            },
            {
                itemIdentifiers: ['measureGroup']
            }
        ];
    }

    return [
        {
            itemIdentifiers: ['measureGroup']
        },
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        }
    ];
};
