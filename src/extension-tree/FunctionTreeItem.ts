import * as vscode from 'vscode';
import { ContextValues } from '../constants';
import { Dashboard, LocalFunction } from '../nuclio';
import { INuclioTreeObject, NuclioTreeBase } from './NuclioTreeItem';

export class FunctionTreeItem extends NuclioTreeBase {

    constructor(
        public readonly functionConfig: LocalFunction,
        public readonly dashboard: Dashboard,
        public readonly projectName: string
    ) {
        super(functionConfig.name, ContextValues.function, vscode.TreeItemCollapsibleState.None);
        this.functionConfig = functionConfig;
    }

    // function have no children in tree view.
    getChildren(): vscode.ProviderResult<INuclioTreeObject[]> {
        return null;
    }
}
