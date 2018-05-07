'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import { createEnvironment } from './environment/createEnvironment';
import { EnvironmentTreeItem } from './extension-tree/EnvironmentTreeItem';
import { FunctionTreeItem } from './extension-tree/FunctionTreeItem';
import { NuclioTreeProvider } from './extension-tree/NuclioTreeProvider';
import { ProjectTreeItem } from './extension-tree/ProjectTreeItem';
import { CreateFunction } from './function/createFunction';
import { deleteLocalFunction } from './function/deletefunction';
import { deploy } from './function/deployFunction';
import { InvokeResult, IResourceIdentifier } from './nuclio';
import { CreateProject } from './project/createProject';
import { DialogResponses } from './utils';

export let channel: vscode.OutputChannel = vscode.window.createOutputChannel('Nuclio');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext): Promise<void> {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension \'nuclio\' is now active!');
    context.subscriptions.push(channel);
    channel.show();

    const nuclioTreeProvider: NuclioTreeProvider = new NuclioTreeProvider();
    vscode.window.registerTreeDataProvider('nuclioTreeProvider', nuclioTreeProvider);

    vscode.commands.registerCommand('nuclioTreeProvider.refresh', () => nuclioTreeProvider.refresh());
    vscode.commands.registerCommand('nuclioTreeProvider.deployFunction', async (func: FunctionTreeItem) => {
        await deploy(func);
        nuclioTreeProvider.refresh();
    });
    vscode.commands.registerCommand('nuclioTreeProvider.invokeFunction', async (func: FunctionTreeItem) => {
        try {
            const invokeResult: InvokeResult = await func.dashboard.invokeFunction({ name: func.functionConfig.name, namespace: func.functionConfig.namespace }, { method: 'get' });
            vscode.window.showInformationMessage('Invoked function successfully');
            channel.appendLine(JSON.stringify(invokeResult));
        } catch (e) {
            vscode.window.showErrorMessage(e.message);
        }
    });

    vscode.commands.registerCommand('nuclioTreeProvider.createProject', async (environment: EnvironmentTreeItem) => {
        await CreateProject(environment.environmentConfig);
        nuclioTreeProvider.refresh();
    });

    vscode.commands.registerCommand('nuclioTreeProvider.createFunction', async (project: ProjectTreeItem) => {
        await CreateFunction(project.projectConfig);
        nuclioTreeProvider.refresh();
    });

    vscode.commands.registerCommand('nuclioTreeProvider.createEnvironment', async () => {
        await createEnvironment();
        nuclioTreeProvider.refresh();
    });

    vscode.commands.registerCommand('nuclioTreeProvider.deleteFunction', async (func: FunctionTreeItem) => {
        const metadata: { name: string, namespace: string } = { name: func.functionConfig.name, namespace: func.functionConfig.namespace };
        await deleteRemoteResource('function', func.dashboard.deleteFunction.bind(func.dashboard), metadata, nuclioTreeProvider);
        await deleteLocalFunction(func);
        nuclioTreeProvider.refresh();
    });
}

// this method is called when your extension is deactivated
// export function deactivate() {
// }

export async function deleteRemoteResource(
    itemType: string, deleteMethod: (id: IResourceIdentifier) => Promise<void>,
    config: IResourceIdentifier, nuclioTreeProvider: NuclioTreeProvider): Promise<void> {

    const message: string = `Are you sure you want to delete ${itemType} ${config.name}?`;
    await vscode.window.showWarningMessage(message, DialogResponses.deleteResponse, DialogResponses.cancel);
    channel.show();
    channel.appendLine(`Deleting ${itemType} ${config.name}...`);

    try {
        await deleteMethod(config);
    } catch (err) {
        channel.appendLine(`Error deleting ${itemType} ${config.name}: ${err.message}`);
    }

    channel.appendLine(`Successfully deleted ${itemType} ${config.name}.`);
    nuclioTreeProvider.refresh();
}
