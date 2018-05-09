import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { ProjectFile } from '../config/projectFile';
import { SettingsFile } from '../config/settingsFile';
import { channel } from '../extension';
import { FunctionTreeItem } from '../extension-tree/FunctionTreeItem';
import { LocalFunction, LocalProject } from '../nuclio';
import { DialogResponses } from '../utils';

export async function deleteFunction(functionTreeItem: FunctionTreeItem) : Promise<void> {
    // First delete the function from Nuclio
    const functionName: string = functionTreeItem.functionConfig.name;
    let message: string = `Are you sure you want to delete function ${functionName}?`;
    await vscode.window.showWarningMessage(message, DialogResponses.deleteResponse, DialogResponses.cancel);
    channel.show();
    channel.appendLine(`Deleting function ${functionName}...`);

    try {
        await functionTreeItem.dashboard.deleteFunction(functionTreeItem.functionConfig);
    } catch (err) {
        channel.appendLine(`Error deleting function ${functionName}: ${err.message}`);
    }

    channel.appendLine(`Successfully deleted function ${functionName} from nuclio.`);

    // Then delete the function from the local folder
    message = `Do you want to delete local source as well?`;
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
