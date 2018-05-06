'use strict';

import * as path from 'path';
import { LocalProject } from '../nuclio';
import { confirmEditJsonFile } from '../utils';
import { ISettingsFile } from './settingsFile';

const fse = require('fs-extra');


// Nuclio project settings file will be saved under project-folder/.vscode/nuclio.json
// This file will contain the project's configurations and the local function under this project.
export interface IProjectFile {
    // Returns the project config folder path (example: project-folder/.vscode) 
    getFolderPath(): string;

    // Returns the project config file path (example: project-folder/.vscode/nuclio.json) 
    getFilePath(): string;

    // Write the project configuration to project file
    writeToProjectConfigAsync(projectConfig: LocalProject): Promise<void>;

    // Write the project configuration to settings file
    writeToSettingsConfigAsync(projectConfig: LocalProject, environmentName: string): Promise<void>;

    // Reads the configuration from nuclio.json file
    readFromFile(): LocalProject;
}

export class ProjectFile implements IProjectFile {

    constructor(private folderPath: string, private settingsFile: ISettingsFile) {
    }

    getFolderPath(): string {
        return path.join(this.folderPath, '.vscode');
    }

    getFilePath(): string {
        return path.join(this.getFolderPath(), 'nuclio.json');
    }

    async writeToProjectConfigAsync(projectConfig: LocalProject): Promise<void> {
        // ensure that the folder .vscode exists
        await this.ensureConfigFolderAsync();

        // Write to project config
        const settingsJsonPath: string = this.getFilePath();
        await confirmEditJsonFile(
            settingsJsonPath,
            (data: LocalProject): {} => {
                data.name = projectConfig.name;
                data.displayName = projectConfig.displayName;
                data.functions = projectConfig.functions;
                // Not sure if needed
                data.path = this.folderPath;

                return data;
            },
        );
    }

    async writeToSettingsConfigAsync(projectConfig: LocalProject, environmentName: string) : Promise<void>{
        await this.settingsFile.updateSettingsFileAsync(projectConfig, environmentName);
    }

    readFromFile(): LocalProject {
        try {
            let projectConfigFile = fse.readJsonSync(this.getFilePath(), 'utf8');
            return new LocalProject(projectConfigFile.name, projectConfigFile.displayName, this.folderPath, projectConfigFile.functions);
        } catch (e) {
            throw new Error(`Error reading file ${this.getFilePath()}: ${e}`);
        }
    }

    private async ensureConfigFolderAsync() : Promise<void> {
        return await fse.ensureDir(this.getFolderPath());
    }
}