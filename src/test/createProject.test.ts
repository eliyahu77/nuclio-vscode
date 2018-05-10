import * as assert from 'assert';
import * as sinon from 'sinon';
import * as tmp from 'tmp';
import * as vscode from 'vscode';
import { ProjectFile } from '../config/projectFile';
import { SettingsFile } from '../config/settingsFile';
import { Dashboard, EnvironmentsConfig, LocalEnvironment, LocalProject } from '../nuclio';
import { CreateProject } from '../project/createProject';

// Notice- this test will deploy actuall project to nuclio.
suite('Create project tests', function (): void {
    const folderPath: tmp.SynchrounousResult = tmp.dirSync({ unsafeCleanup: true });
    const projectPath: tmp.SynchrounousResult = tmp.dirSync({ unsafeCleanup: true });

    test('Project values are set as expected', async function (): Promise<void> {
        // Arrange
        const settingsFile: SettingsFile = new SettingsFile(folderPath.name);

        const name: string = 'env';
        const namespace: string = 'nuclio';
        const address: string = 'http://127.0.0.1:8070';
        const localEnvironment: LocalEnvironment = new LocalEnvironment(name, namespace, address, []);
        await settingsFile.addNewEnvironmentAsync(localEnvironment);

        const showOpenDialog: sinon.SinonStub = sinon.stub(vscode.window, "showOpenDialog");
        const showInputBox: sinon.SinonStub = sinon.stub(vscode.window, "showInputBox");
        const projName: string = 'newproj';
        const description: string = 'proj description';

        showInputBox.onFirstCall().resolves(projName);
        showInputBox.onSecondCall().resolves(''); // will validate that the env namespace was set if the namespace is empty
        showInputBox.onThirdCall().resolves(description);
        showOpenDialog.resolves([vscode.Uri.file(projectPath.name)]);

        // Act
        await CreateProject(localEnvironment, settingsFile);

        // Validate - new project was written to settings file and project file was created
        const environmentConfig: EnvironmentsConfig = await settingsFile.readFromFileAsync();
        const env: LocalEnvironment = environmentConfig.environments[0];
        const projectFile: ProjectFile = new ProjectFile(projectPath.name, settingsFile);
        const localProject: LocalProject = projectFile.readFromFile();

        assert.ok(showInputBox.calledThrice);
        assert.equal(environmentConfig.environments.length, 1);
        assert.equal(env.projects[0].name, localProject.name);
        assert.equal(localProject.functions.length, 0);
        assert.equal(localProject.displayName, projName);
        assert.equal(localProject.namespace, namespace);
        assert.equal(localProject.path.toLowerCase(), projectPath.name.toLowerCase());

        // Cleanup
        const dashboard: Dashboard = new Dashboard(address);
        await dashboard.deleteProject({ name: localProject.name, namespace: namespace });
        showInputBox.restore();
        showOpenDialog.restore();
    });
});
