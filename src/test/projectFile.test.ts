//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as fse from 'fs-extra';
import * as path from 'path';
import { ProjectFile } from '../config/projectFile';
import { SettingsFile } from '../config/settingsFile';
import { userConfigurationFileName } from '../constants';
import { LocalFunction, LocalProject } from '../nuclio';

// Defines a Mocha test suite to group tests of similar kind together
suite('ProjectFile Tests', function (): void {
    const folderPath: string = 'C:\\temp2';
    const settingsFile: SettingsFile = new SettingsFile('C\\temp3');
    // Defines a Mocha unit test
    test('Get methods return correct value', function (): void {
        testCleanup();

        const projectFile: ProjectFile = new ProjectFile(folderPath, settingsFile);

        assert.equal(projectFile.getFolderPath(), path.join(folderPath, '.vscode'));
        assert.equal(projectFile.getFilePath(), path.join(folderPath, '.vscode', userConfigurationFileName));
    });

    test('Project config is correctly generated and updated', async function (): Promise<void> {
        testCleanup();

        const projectFile: ProjectFile = new ProjectFile(folderPath, settingsFile);
        const name: string = 'newproj';
        const displayName: string = 'new proj';
        const projectConfig: LocalProject = new LocalProject(name, displayName, folderPath, []);

        await projectFile.writeToProjectConfigAsync(projectConfig);

        let projectData: LocalProject = projectFile.readFromFile();

        assert.deepEqual(projectConfig, projectData);

        // Add new function to project
        const funcName: string = 'My func';
        const namespace: string = 'nuclio';
        const funcPath: string = path.join(folderPath, 'newfunc');

        // update file
        const functionConfig: LocalFunction = new LocalFunction(funcName, namespace, funcPath);
        projectConfig.functions.push(functionConfig);

        // update settings
        await projectFile.writeToProjectConfigAsync(projectConfig);

        // validate functions were updated
        projectData = projectFile.readFromFile();
        assert.deepEqual(projectConfig, projectData);

    });

    function testCleanup(): void {
        fse.removeSync(path.join(folderPath, '.vscode'));
    }
});
