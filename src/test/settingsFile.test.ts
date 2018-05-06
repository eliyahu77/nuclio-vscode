//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as path from 'path';
import { SettingsFile } from '../config/settingsFile';
import { LocalProject, LocalEnvironment } from '../nuclio';

const fs = require('fs-extra');

suite('SettingsFile Tests', function () {
    const folderPath = 'C:\\temp2';

    test('Default folder path is set correctly', function () {
        testCleanup();
        let settingsFile = new SettingsFile();

        assert.equal(settingsFile.getUserHome(), settingsFile.homeDir);
    });

    test('Settings config is correctly generated and updated', async function () {
        testCleanup();

        let settingsFile = new SettingsFile(folderPath);

        const name = 'env';
        const namespace = 'nuclio';
        const address = 'http://127.0.0.1:8000';

        let localEnvironment = new LocalEnvironment(name, namespace, address, []);

        await settingsFile.addNewEnvironmentAsync(localEnvironment);
        let storedSettings = await settingsFile.readFromFileAsync();

        assert.equal(storedSettings.environments.length, 1);

        let storedEnv = storedSettings.environments.filter(env => env.name === name)[0];

        assert.deepEqual(storedEnv, localEnvironment);

        // Add new project to env
        const projectName = 'newproj';
        const displayName = 'new proj';
        const projectFolderPath = 'C:\\projectFolder';
        let projectConfig = new LocalProject(projectName, displayName, projectFolderPath, []);
        localEnvironment.projects.push({ name: projectConfig.name, path: projectConfig.path });

        await settingsFile.updateSettingsFileAsync(projectConfig, name);
        storedSettings = await settingsFile.readFromFileAsync();

        storedEnv = storedSettings.environments.filter(env => env.name === name)[0];

        assert.deepEqual(storedEnv, localEnvironment);
    });

    function testCleanup() {
        fs.removeSync(path.join(folderPath, '.nuclio-vscode'));
    }
});

