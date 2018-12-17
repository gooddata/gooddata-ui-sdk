// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import get = require('lodash/get');

export function getMasterMeasureLocalIdentifier(measure: AFM.IMeasure): AFM.Identifier {
    const measureDefinition = get<string>(measure, ['definition', 'popMeasure'])
        || get<string>(measure, ['definition', 'previousPeriodMeasure']);
    return get<string>(measureDefinition, ['measureIdentifier']);
}

export function findMeasureByLocalIdentifier(afm: AFM.IAfm, localIdentifier: AFM.Identifier): AFM.IMeasure {
    return (afm.measures || []).find((m: AFM.IMeasure) => m.localIdentifier === localIdentifier);
}

export function getMasterMeasureObjQualifier(afm: AFM.IAfm, localIdentifier: AFM.Identifier) {
    let measure = findMeasureByLocalIdentifier(afm, localIdentifier);
    if (measure) {
        const masterMeasureIdentifier = getMasterMeasureLocalIdentifier(measure);
        if (masterMeasureIdentifier) {
            measure = findMeasureByLocalIdentifier(afm, masterMeasureIdentifier);
        }
        if (!measure) {
            return null;
        }
        return {
            uri: get<string>(measure, ['definition', 'measure', 'item', 'uri']),
            identifier: get<string>(measure, ['definition', 'measure', 'item', 'identifier'])
        };
    }
    return null;
}
