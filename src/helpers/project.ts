import * as invariant from 'invariant';
import { Uri } from '@gooddata/data-layer';

export function getProjectIdByUri(uri: string): string {
    invariant(Uri.isUri(uri), 'Uri does not contain project id.');

    const [, projectId] = Uri.REG_URI_OBJ.exec(uri);

    return projectId;
}
