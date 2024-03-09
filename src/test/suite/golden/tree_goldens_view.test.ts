import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { goldensNameSpace } from '../../../golden/tree_goldens_view';

suite('TreeGoldenView Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('TreeGoldenView.projectsData should start empty', () => {
        let view = new goldensNameSpace.TreeGoldenView();
        assert.equal(view.projectsData.length, 0)
    });
});
