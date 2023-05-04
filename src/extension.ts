import * as vscode from 'vscode';
import { goldesNameSpace } from './tree_view';


export function activate(context: vscode.ExtensionContext) {

	let tree = new goldesNameSpace.TreeGoldenView();
	vscode.window.registerTreeDataProvider('golden_failures', tree);
	tree.refresh();

}

