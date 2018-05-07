import * as vscode from 'vscode';
import { SettingsFile } from '../config/settingsFile';
import { EnvironmentsConfig, LocalEnvironment } from '../nuclio';
import { EnvironmentTreeItem } from './EnvironmentTreeItem';
import { INuclioTreeObject } from './NuclioTreeItem';

export class NuclioTreeProvider implements vscode.TreeDataProvider<INuclioTreeObject> {
    _onDidChangeTreeData: vscode.EventEmitter<INuclioTreeObject | undefined> = new vscode.EventEmitter<INuclioTreeObject | undefined>();
    readonly onDidChangeTreeData: vscode.Event<INuclioTreeObject | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: INuclioTreeObject): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element.getTreeItem();
    }

    public getChildren(element?: INuclioTreeObject): vscode.ProviderResult<INuclioTreeObject[]> {
        if (typeof element === 'undefined') {
            return new Promise(
                async (resolve: any): Promise<void> => {
                    const settingsFile: SettingsFile = new SettingsFile();
                    const settingsData: EnvironmentsConfig = await settingsFile.readFromFileAsync();
                    return resolve(settingsData.environments.map((env: LocalEnvironment) => new EnvironmentTreeItem(env)));
                }
            );
        }

        return element.getChildren();
    }
}
