'use strict';

import * as fse from 'fs-extra';
import * as path from 'path';
import { userConfigurationDir, userConfigurationFileName } from '../constants';
import { EnvironmentsConfig, LocalEnvironment, LocalProject } from '../nuclio';
import { writeFormattedJson } from '../utils';

// Nuclio global settings file will be saved under Home/.nuclio-vscode/nuclio.json
// This file will contain the different Nuclio Dashboard configurations and the local projects folder mapping.
export interface ISettingsFile {

    // return the user home directory - compatible for different operation systems.
    getUserHome(): string;

    // gets the settings file path
    getFolderPath(): string;

    // Get the full Home/.nuclio-vscode/nuclio.json file path
    getFilePath(): string;

    // Write the project configuration to nuclio.json file
    addNewEnvironmentAsync(newEnv: LocalEnvironment): Promise<void>;

    // Updates the settings file with a new added project
    updateSettingsFileAsync(projectConfig: LocalProject, environmentName: string): Promise<void>;

    // Reads the configuration from Home/.nuclio-vscode/nuclio.json file
    readFromFileAsync(folderPath: string): Promise<EnvironmentsConfig>;
}

export class SettingsFile implements ISettingsFile {
    public homeDir: string;

    constructor(dir?: string) {
        this.homeDir = dir || this.getUserHome();
    }

    public getUserHome(): string {
        return process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH;
    }

    public getFolderPath(): string {
        return path.join(this.homeDir, userConfigurationDir);
    }

    public getFilePath(): string {
        return path.join(this.getFolderPath(), userConfigurationFileName);
    }

    public async updateSettingsFileAsync(projectConfig: LocalProject, environmentName: string): Promise<void> {
        // Write to settings file
        const settingsData: EnvironmentsConfig = await this.readFromFileAsync();
        const currentEnv: LocalEnvironment = settingsData.environments.find((env: LocalEnvironment) => env.name === environmentName);

        if (currentEnv) {
            currentEnv.projects.push({
                name: projectConfig.name,
                path: projectConfig.path
            });

            return await writeFormattedJson(this.getFilePath(), settingsData);
        }

        throw new Error(`Environment ${environmentName} was not found in settings file`);

    }

    // Write the environment configuration to nuclio.json file
    public async addNewEnvironmentAsync(newEnv: LocalEnvironment): Promise<void> {
        // ensure that folder .nuclio-vscode exists
        this.ensureSettingsFolderAsync();

        let data: EnvironmentsConfig;
        const filePath: string = this.getFilePath();
        if (await fse.pathExists(filePath)) {
            data = await fse.readJson(filePath);
            data.environments.push(newEnv);
        } else {
            data = { environments: [newEnv] };
        }

        await writeFormattedJson(this.getFilePath(), data);
    }

    // Reads the configuration from nuclio.json file
    public async readFromFileAsync(): Promise<EnvironmentsConfig> {
        const environmentConfigPath: string = this.getFilePath();
        const pathExists: boolean = await fse.pathExists(this.getFilePath());

        if (pathExists) {
            return await fse.readJson(environmentConfigPath);
        }

        return new EnvironmentsConfig();
    }

    private async ensureSettingsFolderAsync(): Promise<void> {
        return await fse.ensureDir(this.getFolderPath());
    }
}
