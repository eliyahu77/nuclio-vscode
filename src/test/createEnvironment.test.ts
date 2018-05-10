import * as assert from 'assert';
import * as sinon from 'sinon';
import * as tmp from 'tmp';
import * as vscode from 'vscode';
import { SettingsFile } from '../config/settingsFile';
import { createEnvironment } from '../environment/createEnvironment';
import { EnvironmentsConfig, LocalEnvironment } from '../nuclio';

suite('Create environment tests', function (): void {
    const name: string = 'newenv';
    const namespace: string = 'nuclio';
    let address: string = 'http://127.0.0.1:8070';

    test('Environment values set as expected', async function (): Promise<void> {
        // Arrange
        const folderPath: tmp.SynchrounousResult = tmp.dirSync({unsafeCleanup: true});
        const showInputBox: sinon.SinonStub = sinon.stub(vscode.window, "showInputBox");

        showInputBox.onFirstCall().resolves(name);
        showInputBox.onSecondCall().resolves(namespace);
        showInputBox.onThirdCall().resolves(address);

        // Act
        const settingsFile: SettingsFile = new SettingsFile(folderPath.name);
        await createEnvironment(settingsFile);

        // Valudate
        const environmentConfig: EnvironmentsConfig = await settingsFile.readFromFileAsync();

        assert.ok(showInputBox.calledThrice);
        assert.equal(environmentConfig.environments.length, 1);

        const env: LocalEnvironment = environmentConfig.environments[0];
        assert.equal(env.name, name);
        assert.equal(env.namespace, namespace);
        assert.equal(env.address, address);

        showInputBox.restore();
    });

    test('Environment is not created when address is empty', async function (): Promise<void> {
        // Arrange
        const folderPath: tmp.SynchrounousResult = tmp.dirSync({unsafeCleanup: true});
        const showInputBox: sinon.SinonStub = sinon.stub(vscode.window, "showInputBox");
        address = '';

        showInputBox.onFirstCall().resolves(name);
        showInputBox.onSecondCall().resolves(namespace);
        showInputBox.onThirdCall().resolves(address);

        // Act
        const settingsFile: SettingsFile = new SettingsFile(folderPath.name);
        await createEnvironment(settingsFile);

        // Valudate
        const environmentConfig: EnvironmentsConfig = await settingsFile.readFromFileAsync();

        assert.ok(showInputBox.calledThrice);
        assert.equal(environmentConfig.environments.length, 0);

        showInputBox.restore();
    });
});
