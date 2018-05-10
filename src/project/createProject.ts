'use strict';

import * as vscode from 'vscode';
import { ProjectFile } from '../config/projectFile';
import { ISettingsFile } from '../config/settingsFile';
import { selectFolder } from '../folderSelector';
import { Dashboard, LocalEnvironment, LocalProject, ProjectConfig } from '../nuclio';
import { isEmptyString } from '../utils';

export async function CreateProject(environmentConfig: LocalEnvironment, settingsFile: ISettingsFile): Promise<void> {
    const dashboard: Dashboard = new Dashboard(environmentConfig.address);

    const displayName: string = await vscode.window.showInputBox({ prompt: 'Enter the project\'s name', ignoreFocusOut: true });
    let namespace: string = await vscode.window.showInputBox({ prompt: 'Enter the new project namespace', ignoreFocusOut: true });
    const description: string = await vscode.window.showInputBox({ prompt: 'Enter the project\'s description', ignoreFocusOut: true });
    const filePath: string = await selectFolder('Select the folder for the project');

    if (isEmptyString(namespace)) {
        namespace = environmentConfig.namespace;
    }

    let projectConfig: ProjectConfig = new ProjectConfig();
    projectConfig.metadata.namespace = namespace;
    projectConfig.spec.description = description;
    projectConfig.spec.displayName = displayName;

    const projectFileConfig: ProjectFile = new ProjectFile(filePath, settingsFile);

    // Create the project in nuclio
    projectConfig = await dashboard.createProject(projectConfig);

    vscode.window.showInformationMessage('Project created successfully');
    const projectInEnvironment: LocalProject = new LocalProject(projectConfig.metadata.name, namespace, displayName, filePath, []);
    await projectFileConfig.writeToProjectConfigAsync(projectInEnvironment);

    // Update the settings file with the new added environment
    await projectFileConfig.writeToSettingsConfigAsync(projectInEnvironment, environmentConfig.name);

    vscode.window.showInformationMessage('Settings files were updated successfully');
}
