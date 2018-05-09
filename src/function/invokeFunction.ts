import * as vscode from 'vscode';
import { channel } from '../extension';
import { FunctionTreeItem } from "../extension-tree/FunctionTreeItem";
import { InvokeResult } from '../nuclio';

export async function invokeFunctionAsync(functionTreeItem: FunctionTreeItem): Promise<void> {
    try {
        if (await isFunctionDeployedAsync(functionTreeItem)) {
            const invokeResult: InvokeResult = await functionTreeItem.dashboard.invokeFunction(
                {
                    name: functionTreeItem.functionConfig.name,
                    namespace: functionTreeItem.functionConfig.namespace
                },
                { method: 'get' });
            vscode.window.showInformationMessage('Invoked function successfully');
            channel.appendLine(JSON.stringify(invokeResult));
        } else {
            vscode.window.showErrorMessage('Function needs to be deployed before invocation');
        }
    } catch (e) {
        vscode.window.showErrorMessage(e.message);
    }
}

async function isFunctionDeployedAsync(functionTreeItem: FunctionTreeItem): Promise<boolean> {
    try {
        await functionTreeItem.dashboard.getFunctions(
            {
                namespace: functionTreeItem.functionConfig.namespace,
                name: functionTreeItem.functionConfig.name,
                projectName: functionTreeItem.projectName
            });
        return true;
    } catch (ex) {
        // function is not deployed - return false
        if (ex.response.statusText === "Not Found") {
            return false;
        }
        // Other exception - throw error
        throw ex;
    }
}
