import * as vscode from 'vscode';
import { goldensNameSpace } from './tree_view';


export function activate(context: vscode.ExtensionContext) {

	let tree = new goldensNameSpace.TreeGoldenView();
	vscode.window.registerTreeDataProvider('golden_failures', tree);
	tree.refresh();

}

