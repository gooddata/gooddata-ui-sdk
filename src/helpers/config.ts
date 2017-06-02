import { Afm, Transformation } from '@gooddata/data-layer';
import { toVisObj } from '../legacy/toVisObj';
import * as VisObj from '../legacy/model/VisualizationObject';

export function generateConfig(
    type,
    afm: Afm.IAfm,
    transformation: Transformation.ITransformation,
    config = {},
    headers = []
) {
    const buckets: VisObj.IVisualizationObject = toVisObj(type, afm, transformation, headers);

    return {
        ...buckets,
        ...config
    };
}
