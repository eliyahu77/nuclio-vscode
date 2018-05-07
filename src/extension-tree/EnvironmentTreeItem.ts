import * as vscode from 'vscode';
import { ProjectFile } from '../config/projectFile';
import { SettingsFile } from '../config/settingsFile';
import { ContextValues } from '../constants';
import { LocalEnvironment, LocalProject } from '../nuclio';
import { isEmpty } from '../utils';
import { INuclioTreeObject, NuclioTreeBase } from './NuclioTreeItem';
import { ProjectTreeItem } from './ProjectTreeItem';

export class EnvironmentTreeItem extends NuclioTreeBase {

    constructor(
        public readonly environmentConfig: LocalEnvironment
    ) {
        super(environmentConfig.name, ContextValues.environment, vscode.TreeItemCollapsibleState.Expanded);
    }

    getChildren(): vscode.ProviderResult<INuclioTreeObject[]> {
        return new Promise(async (resolve: any, reject: any): Promise<any> => {
            try {
                const projects: LocalProject[] = await this.getProjectsFromConfig(this.environmentConfig);
                if (isEmpty(projects)) {
                    return resolve([]);
                }
                return resolve(projects.map((project: LocalProject) => new ProjectTreeItem(project, this.environmentConfig)));
            } catch (e) {
                reject(e);
            }
        });
    }

    async getProjectsFromConfig(environmentConfig: LocalEnvironment): Promise<LocalProject[]> {
        if (isEmpty(environmentConfig.projects)) {
            return [];
        }

        return environmentConfig.projects.map((project: { name: string, path: string }) => {
            const projectFileConfig: ProjectFile = new ProjectFile(project.path, new SettingsFile());
            return projectFileConfig.readFromFile();
        });
    }
}
