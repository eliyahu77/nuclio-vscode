import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { ProjectFile } from '../config/projectFile';
import { SettingsFile } from '../config/settingsFile';
import { dotNetCoreHandlerCode, goHandlerCode, javaHandlerCode, nodejsHandlerCode, pythonHandlerCode } from '../constants';
import { INuclioQuickPickItem, selectFolder } from '../folderSelector';
import { FunctionConfig, LocalFunction, LocalProject } from '../nuclio';
import { writeFormattedJson } from '../utils';

export async function CreateFunction(projectConfig: LocalProject): Promise<void> {
    const functionPath: string = await selectFolder('Select the folder for the function');
    const functionYamlPath: string = path.join(functionPath, 'function.yaml');

    let functionName: string;
    let functionNamespace: string;

    // check if function contains yaml
    if (!await fse.pathExists(functionYamlPath)) {
        // Otherwise- create it.
        functionName = await vscode.window.showInputBox({ prompt: 'Enter the new function name' });
        functionNamespace = await vscode.window.showInputBox({ prompt: 'Enter the new function namespace' });

        const picks: INuclioQuickPickItem<FunctionRuntime | string>[] = Object.keys(FunctionRuntime)
            .map((t: string) => { return { data: FunctionRuntime[t], label: t, description: '' }; });
        const options: vscode.QuickPickOptions = { placeHolder: 'Select the runtime' };
        const runtime: any  = await vscode.window.showQuickPick(picks, options);

        let handler: string = 'main:Handler';
        let handlerCode: string;
        let fileExtension: string;

        switch (runtime.data) {
            case FunctionRuntime.Go:
                fileExtension = '.go';
                handlerCode = goHandlerCode;
                break;
            case FunctionRuntime.NetCore:
                fileExtension = '.cs';
                handlerCode = dotNetCoreHandlerCode;
                break;
            case FunctionRuntime.NodeJs:
                fileExtension = '.js';
                handlerCode = nodejsHandlerCode;
                break;
            case FunctionRuntime.Python27:
            case FunctionRuntime.Python36:
            case FunctionRuntime.PyPy:
                handlerCode = pythonHandlerCode;
                fileExtension = '.py';
                break;
            case FunctionRuntime.Shell:
                fileExtension = '.sh';
                handlerCode = '';
                handler = '';
                break;
            case FunctionRuntime.Java:
                fileExtension = '.java';
                handlerCode = javaHandlerCode;
                handler = 'Handler';
                break;
            default:
                throw new Error('Unknown runtime selected');
        }

        // Create .yaml file
        const yamlPath: string = path.join(functionPath, 'function.yaml');
        const functionConfig : FunctionConfig = new FunctionConfig();
        functionConfig.metadata.name = functionName;
        functionConfig.metadata.namespace = functionNamespace;
        functionConfig.spec.runtime = runtime.data;
        functionConfig.spec.handler = handler;
        functionConfig.spec.replicas = 1;

        await writeFormattedJson(yamlPath, functionConfig);

        // Create empty handler file
        const handlerFilePath: string = path.join(functionPath, `handler ${fileExtension}`);
        await fse.writeFile(handlerFilePath, handlerCode);
    } else {
        const functionYaml: FunctionConfig = await fse.readJson(functionYamlPath);
        functionName = functionYaml.metadata.name;
        functionNamespace = functionYaml.metadata.namespace;
    }

    // Update project config with function details
    const projectFileConfig: ProjectFile = new ProjectFile(projectConfig.path, new SettingsFile());
    const projectData: LocalProject = await projectFileConfig.readFromFile();
    projectData.functions.push(new LocalFunction(functionName, functionNamespace, functionPath));
    projectFileConfig.writeToProjectConfigAsync(projectData);
}

export enum FunctionRuntime {
    Go = 'golang',
    Python27 = 'python:2.7',
    Python36 = 'python:3.6',
    PyPy = 'pypy',
    NetCore = 'dotnetcore',
    Java = 'java',
    NodeJs = 'nodejs',
    Shell = 'shell'
}
