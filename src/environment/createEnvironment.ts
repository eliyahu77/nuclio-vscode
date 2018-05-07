import * as vscode from 'vscode';
import { SettingsFile } from '../config/settingsFile';
import { LocalEnvironment } from '../nuclio';

export async function createEnvironment(): Promise<void> {

    const settingsFile : SettingsFile = new SettingsFile();

    // Get environment details
    const name : string = await vscode.window.showInputBox({ prompt: 'Enter the new environment name' });
    const namespace: string = await vscode.window.showInputBox({ prompt: 'Enter the new environment namespace' });

    let address: string = await vscode.window.showInputBox({ prompt: 'Enter the new environment address' });
    if (!address.startsWith('http')) {
        address = `http://${address}`;
    }

    const newEnv: LocalEnvironment = new LocalEnvironment(name, namespace, address, []);

    settingsFile.addNewEnvironmentAsync(newEnv);
}
