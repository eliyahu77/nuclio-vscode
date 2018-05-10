//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as tmp from 'tmp';
import { SettingsFile } from '../config/settingsFile';
import { EnvironmentsConfig, LocalEnvironment, LocalProject } from '../nuclio';

suite('SettingsFile Tests', function (): void {
    test('Default folder path is set correctly', function (): void {
        const settingsFile: SettingsFile = new SettingsFile();

        assert.equal(settingsFile.getUserHome(), settingsFile.homeDir);
    });

    test('Settings config is correctly generated and updated', async function (): Promise<void> {
        const folderPath: tmp.SynchrounousResult = tmp.dirSync({unsafeCleanup: true});
        const settingsFile: SettingsFile = new SettingsFile(folderPath.name);

        const name: string = 'env';
        const namespace: string = 'nuclio';
        const address: string = 'http://127.0.0.1:8000';

        const localEnvironment: LocalEnvironment = new LocalEnvironment(name, namespace, address, []);

        await settingsFile.addNewEnvironmentAsync(localEnvironment);
        let storedSettings: EnvironmentsConfig = await settingsFile.readFromFileAsync();

        assert.equal(storedSettings.environments.length, 1);

        let storedEnv: LocalEnvironment = storedSettings.environments.filter((env: LocalEnvironment) => env.name === name)[0];

        assert.deepEqual(storedEnv, localEnvironment);

        // Add new project to env
        const projectName: string = 'newproj';
        const displayName: string = 'new proj';
        const projectFolderPath: string = 'C:\\projectFolder';
        const projectConfig: LocalProject = new LocalProject(projectName, namespace, displayName, projectFolderPath, []);
        localEnvironment.projects.push({ name: projectConfig.name, path: projectConfig.path });

        await settingsFile.updateSettingsFileAsync(projectConfig, name);
        storedSettings = await settingsFile.readFromFileAsync();

        storedEnv = storedSettings.environments.filter((env: LocalEnvironment) => env.name === name)[0];

        assert.deepEqual(storedEnv, localEnvironment);
    });
});
