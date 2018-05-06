'use strict';

import * as nuclio from '../nuclio';
import { writeFormattedJson } from '../utils';
import * as path from 'path';
import * as vscode from 'vscode';
import { selectFolder, NuclioQuickPickItem } from '../folderSelector';
import { ProjectFile } from '../config/projectFile';
import { SettingsFile } from '../config/settingsFile';
import { goHandlerCode, dotNetCoreHandlerCode, nodejsHandlerCode, pythonHandlerCode, javaHandlerCode } from '../constants';

const fse = require('fs-extra');

export async function CreateFunction(projectConfig: nuclio.LocalProject) {
    const functionPath = await selectFolder('Select the folder for the function');
    const functionYamlPath = path.join(functionPath, 'function.yaml');

    let functionName: string;
    let functionNamespace: string;

    // check if function contains yaml
    if (!await fse.pathExists(functionYamlPath)) {
        // Otherwise- create it.
        functionName = await vscode.window.showInputBox({ prompt: 'Enter the new function name' });
        functionNamespace = await vscode.window.showInputBox({ prompt: 'Enter the new function namespace' });

        const picks: NuclioQuickPickItem<FunctionRuntime | string>[] = Object.keys(FunctionRuntime)
            .map((t: string) => { return { data: FunctionRuntime[t], label: t, description: '' }; });
        const options: vscode.QuickPickOptions = { placeHolder: 'Select the runtime' };
        const runtime = await vscode.window.showQuickPick(picks, options);

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
        }

        // Create .yaml file
        const yamlPath: string = path.join(functionPath, 'function.yaml');
        let data = {
            metadata: {
                name: functionName,
                namespace: functionNamespace,
            },
            spec: {
                runtime: runtime.data,
                handler: handler,
                replicas: 1,
                build: {}
            }
        };

        await writeFormattedJson(yamlPath, data);

        // Create empty handler file
        let handlerFilePath = path.join(functionPath, 'handler' + fileExtension);
        await fse.writeFile(handlerFilePath, handlerCode);
    } else {
        let functionYaml = await fse.readJson(functionYamlPath);
        functionName = functionYaml['metadata']['name'];
        functionNamespace = functionYaml['metadata']['namespace'];
    }

    // Update project config with function details
    let projectFileConfig = new ProjectFile(projectConfig.path, new SettingsFile());
    let projectData = await projectFileConfig.readFromFile();
    projectData.functions.push(new nuclio.LocalFunction(functionName, functionNamespace, functionPath));
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
    Shell = 'shell',
}