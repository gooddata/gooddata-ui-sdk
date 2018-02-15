import { writeFile } from 'fs';
import { exec } from 'child_process';
import RCPackageJson from '../../../package.json'; // eslint-disable-line import/no-unresolved
import ExamplesPackageJson from '../../package.json';

const { version } = RCPackageJson;

const newPackageJson = {
    ...ExamplesPackageJson,
    version
};

console.log(`updating versions in examples package.json to ${version}`); // eslint-disable-line no-console
writeFile('package.json', JSON.stringify(newPackageJson, null, '  '), (err) => {
    if (err) {
        return console.log(err); // eslint-disable-line no-console
    }

    console.log('package.json version updated'); // eslint-disable-line no-console
    console.log('Updating @gooddata/react-components@'); // eslint-disable-line no-console

    return exec(`yarn upgrade @gooddata/react-components@${version}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`); // eslint-disable-line no-console
            console.log(`stderr: ${stderr}`); // eslint-disable-line no-console
            process.exit(1);
        }
        process.exit(0);
    });
});
