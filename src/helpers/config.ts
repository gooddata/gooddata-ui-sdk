import { Afm, Transformation } from '@gooddata/data-layer';
import { Converters } from '@gooddata/data-layer';
import * as VisObj from '@gooddata/data-layer/dist/legacy/model/VisualizationObject';

export function generateConfig(
    type,
    afm: Afm.IAfm,
    transformation: Transformation.ITransformation,
    config = {},
    headers = []
) {
    const buckets: VisObj.IVisualizationObject = Converters.toVisObj(type, afm, transformation, headers);

    return {
        ...buckets,
        ...config
    };
}
