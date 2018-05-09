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
import { deleteFunction } from './function/deletefunction';
import { deploy } from './function/deployFunction';
import { invokeFunctionAsync } from './function/invokeFunction';
import { openFunctionInEditorAsync } from './function/openFunctionInEditor';
import { CreateProject } from './project/createProject';

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
        await invokeFunctionAsync(func);
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
        await deleteFunction(func);
        nuclioTreeProvider.refresh();
    });

    vscode.commands.registerCommand('nuclioTreeProvider.openFunctionInEditor', async (func: FunctionTreeItem) => {
        await openFunctionInEditorAsync(func.functionConfig.path);
    });
}

// this method is called when your extension is deactivated
// export function deactivate() {
// }
