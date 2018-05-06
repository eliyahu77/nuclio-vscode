//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as path from 'path';
import { ProjectFile } from '../config/projectFile';
import { userConfigurationFileName } from '../constants';
import { LocalProject, LocalFunction } from '../nuclio';
import { SettingsFile } from '../config/settingsFile';

const fs = require('fs-extra');

// Defines a Mocha test suite to group tests of similar kind together
suite('ProjectFile Tests', function () {
    const folderPath = 'C:\\temp2';
    let settingsFile = new SettingsFile('C\\temp3');
    // Defines a Mocha unit test
    test('Get methods return correct value', function() {
        testCleanup();

        let projectFile = new ProjectFile(folderPath, settingsFile);

        assert.equal(projectFile.getFolderPath(), path.join(folderPath, '.vscode'));
        assert.equal(projectFile.getFilePath(), path.join(folderPath, '.vscode', userConfigurationFileName));
    });

    test('Project config is correctly generated and updated', async function() {
        testCleanup();

        let projectFile = new ProjectFile(folderPath, settingsFile);
        const name = 'newproj';
        const displayName =  'new proj';
        let projectConfig = new LocalProject(name, displayName, folderPath, []);

        await projectFile.writeToProjectConfigAsync(projectConfig);

        let projectData = projectFile.readFromFile();

        assert.deepEqual(projectConfig, projectData);
        
        // Add new function to project
        const funcName = 'My func';
        const namespace = 'nuclio';
        const funcPath = path.join(folderPath, 'newfunc');

        // update file
        let functionConfig = new LocalFunction(funcName, namespace, funcPath);
        projectConfig.functions.push(functionConfig);

        // update settings
        await projectFile.writeToProjectConfigAsync(projectConfig);

        // validate functions were updated
        projectData = projectFile.readFromFile();
        assert.deepEqual(projectConfig, projectData);

    });

    function testCleanup() {
        fs.removeSync(path.join(folderPath, '.vscode'));
    }
});

