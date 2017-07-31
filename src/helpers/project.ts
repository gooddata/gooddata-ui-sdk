import { Uri } from '@gooddata/data-layer';

export function getProjectIdByUri(uri: string): string {
    const regexExec = Uri.REG_URI_OBJ.exec(uri) || [];
    return regexExec[1];
}
