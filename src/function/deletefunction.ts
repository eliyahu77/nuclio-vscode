import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { ProjectFile } from '../config/projectFile';
import { SettingsFile } from '../config/settingsFile';
import { FunctionTreeItem } from '../extension-tree/FunctionTreeItem';
import { LocalFunction, LocalProject } from '../nuclio';
import { DialogResponses } from '../utils';

export async function deleteLocalFunction(functionTreeItem: FunctionTreeItem) : Promise<void> {
    const message: string = `Do you want to delete local source as well?`;
    await vscode.window.showWarningMessage(message, DialogResponses.deleteResponse, DialogResponses.cancel);

    // Remove folder and files
    fse.removeSync(functionTreeItem.functionConfig.path);

    // Remove function config from json
    // Assuming the function was in sub-folder of the project
    const projectFile: ProjectFile = new ProjectFile(path.join(functionTreeItem.functionConfig.path, '..'), new SettingsFile());

    const projectConfigFile: LocalProject = projectFile.readFromFile();
    projectConfigFile.functions = projectConfigFile.functions.filter((func: LocalFunction) => func.name !== functionTreeItem.functionConfig.name);
    await projectFile.writeToProjectConfigAsync(projectConfigFile);
}
