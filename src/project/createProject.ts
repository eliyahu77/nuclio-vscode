'use strict';

import * as vscode from 'vscode';
import { ProjectFile } from '../config/projectFile';
import { SettingsFile } from '../config/settingsFile';
import { selectFolder } from '../folderSelector';
import { Dashboard, LocalEnvironment, LocalProject, ProjectConfig } from '../nuclio';

export async function CreateProject(environmentConfig: LocalEnvironment): Promise<void> {
    const dashboard: Dashboard = new Dashboard(environmentConfig.address);

    const displayName: string = await vscode.window.showInputBox({ prompt: 'Enter the project\'s name' });
    const namespace: string = await vscode.window.showInputBox({ prompt: 'Enter the new project namespace' });
    const description: string = await vscode.window.showInputBox({ prompt: 'Enter the project\'s description' });
    const filePath: string = await selectFolder('Select the folder for the project');

    let projectConfig: ProjectConfig = new ProjectConfig();
    projectConfig.metadata.namespace = namespace;
    projectConfig.spec.description = description;
    projectConfig.spec.displayName = displayName;

    const settingsFile: SettingsFile = new SettingsFile();
    const projectFileConfig: ProjectFile = new ProjectFile(filePath, settingsFile);

    // Create the project in nuclio
    projectConfig = await dashboard.createProject(projectConfig);

    vscode.window.showInformationMessage('Project created successfully');

    const projectInEnvironment: LocalProject = new LocalProject(projectConfig.metadata.name, displayName, filePath, []);
    await projectFileConfig.writeToProjectConfigAsync(projectInEnvironment);

    // Update the settings file with the new added environment
    await projectFileConfig.writeToSettingsConfigAsync(projectInEnvironment, environmentConfig.name);

    vscode.window.showInformationMessage('Settings files were updated successfully');
}
