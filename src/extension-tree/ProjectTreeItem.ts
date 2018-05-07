'use strict';

import * as vscode from 'vscode';
import { ContextValues } from '../constants';
import { Dashboard, LocalEnvironment, LocalFunction, LocalProject } from '../nuclio';
import { isEmpty } from '../utils';
import { FunctionTreeItem } from './FunctionTreeItem';
import { INuclioTreeObject, NuclioTreeBase } from './NuclioTreeItem';

export class ProjectTreeItem extends NuclioTreeBase {

    constructor(
        public readonly projectConfig: LocalProject,
        public readonly environmentConfig: LocalEnvironment
    ) {
        super(projectConfig.displayName, ContextValues.project, vscode.TreeItemCollapsibleState.Expanded);
    }

    getChildren(): vscode.ProviderResult<INuclioTreeObject[]> {
        return new Promise(
            async (resolve: any): Promise<void> => {
                const functionConfigs: LocalFunction[] = await this.getFunctionsFromConfig(this.projectConfig.functions);
                if (isEmpty(functionConfigs)) {
                    return resolve();
                }
                const functionTreeItems: INuclioTreeObject[] = functionConfigs.map((functionConfig: LocalFunction) =>
                    new FunctionTreeItem(functionConfig, new Dashboard(this.environmentConfig.address), this.projectConfig.name));
                return resolve(functionTreeItems);
            });
    }

    async getFunctionsFromConfig(functions: LocalFunction[]): Promise<LocalFunction[]> {
        if (isEmpty(functions)) {
            return [];
        }

        return functions.map((func: LocalFunction) => {
            return new LocalFunction(func.name, func.namespace, func.path);
        });
    }
}
