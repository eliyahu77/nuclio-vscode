import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Open all the available files in functionPath in the editor.
 * @param functionPath - the path of the function files
 */
export async function openFunctionInEditorAsync(functionPath: string): Promise<void> {

    const file: vscode.Uri = vscode.Uri.file(functionPath);

    await fse.readdirSync(functionPath).forEach(async (f: string) => {
        const textDocument: vscode.TextDocument = await vscode.workspace.openTextDocument(path.join(functionPath, f));
        await vscode.window.showTextDocument(textDocument, { preview: false });
    });

    vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0, null, { uri: file });
}
