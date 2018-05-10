import * as assert from 'assert';
import * as path from 'path';
import * as tmp from 'tmp';
import { ProjectFile } from '../config/projectFile';
import { SettingsFile } from '../config/settingsFile';
import { userConfigurationFileName } from '../constants';
import { LocalFunction, LocalProject } from '../nuclio';

suite('ProjectFile Tests', function (): void {
    const folderPath: tmp.SynchrounousResult = tmp.dirSync({unsafeCleanup: true});
    const settingsFile: SettingsFile = new SettingsFile(folderPath.name);

    test('Get methods return correct value', function (): void {
        const projectFile: ProjectFile = new ProjectFile(folderPath.name, settingsFile);

        assert.equal(projectFile.getFolderPath(), path.join(folderPath.name, '.vscode'));
        assert.equal(projectFile.getFilePath(), path.join(folderPath.name, '.vscode', userConfigurationFileName));
    });

    test('Project config is correctly generated and updated', async function (): Promise<void> {
        const projectFile: ProjectFile = new ProjectFile(folderPath.name, settingsFile);
        const name: string = 'newproj';
        const namespace: string = 'nuclio';
        const displayName: string = 'new proj';
        const projectConfig: LocalProject = new LocalProject(name, namespace, displayName, folderPath.name, []);

        await projectFile.writeToProjectConfigAsync(projectConfig);

        let projectData: LocalProject = projectFile.readFromFile();

        assert.deepEqual(projectConfig, projectData);

        // Add new function to project
        const funcName: string = 'My func';
        const funcPath: string = path.join(folderPath.name, 'newfunc');

        // update file
        const functionConfig: LocalFunction = new LocalFunction(funcName, namespace, funcPath);
        projectConfig.functions.push(functionConfig);

        // update settings
        await projectFile.writeToProjectConfigAsync(projectConfig);

        // validate functions were updated
        projectData = projectFile.readFromFile();
        assert.deepEqual(projectConfig, projectData);
    });
});
