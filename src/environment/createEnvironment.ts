import * as vscode from 'vscode';
import { SettingsFile } from '../config/settingsFile';
import { defaultNamespace } from '../constants';
import { LocalEnvironment } from '../nuclio';
import { isEmptyString } from '../utils';

export async function createEnvironment(): Promise<void> {
    const settingsFile: SettingsFile = new SettingsFile();

    // Get environment details
    const name: string = await vscode.window.showInputBox({
        prompt: 'Enter the new environment name',
        ignoreFocusOut: true
    });

    let namespace: string = await vscode.window.showInputBox({ prompt: 'Enter the new environment namespace', ignoreFocusOut: true });

    if (isEmptyString(namespace)) {
        namespace = defaultNamespace;
    }

    let address: string = await vscode.window.showInputBox({ prompt: 'Enter the new environment address', ignoreFocusOut: true, value: "http://localhost:8070" });
    if (isEmptyString(address)) {
        vscode.window.showErrorMessage(`Address must be provided`);
        return;
    }

    if (!address.startsWith('http')) {
        address = `http://${address}`;
    }

    const newEnv: LocalEnvironment = new LocalEnvironment(name, namespace, address, []);

    settingsFile.addNewEnvironmentAsync(newEnv);
}
