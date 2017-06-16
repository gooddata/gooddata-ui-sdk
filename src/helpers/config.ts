import { Afm, Transformation, Converters } from '@gooddata/data-layer';
import * as VisObj from '@gooddata/data-layer/dist/legacy/model/VisualizationObject';
import { IHeader } from '@gooddata/data-layer/dist/interfaces/Header';

export function generateConfig(
    type: string,
    afm: Afm.IAfm,
    transformation: Transformation.ITransformation,
    config = {},
    headers: IHeader[] = []
) {
    const buckets: VisObj.IVisualizationObject = Converters.toVisObj(type, afm, transformation, headers);

    return {
        ...buckets,
        ...config
    };
}
