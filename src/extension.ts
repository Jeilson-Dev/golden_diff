import * as vscode from 'vscode';
import { goldensNameSpace } from './tree_view';


export function activate(context: vscode.ExtensionContext) {

	let tree = new goldensNameSpace.TreeGoldenView();
	vscode.window.registerTreeDataProvider('golden_failures', tree);
	tree.refresh();

	const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
	const watcher = vscode.workspace.createFileSystemWatcher(

		new vscode.RelativePattern(workspaceRoot, '**/*')
	);

	watcher.onDidChange((e: vscode.Uri) => {
		const filePath = e.fsPath;
		if (filePath.includes('test/golden_test/failures')) updateTreeDebounced();
	});

	watcher.onDidCreate((e: vscode.Uri) => {
		const filePath = e.fsPath;
		if (filePath.includes('test/golden_test/failures')) updateTreeDebounced();
	});



	context.subscriptions.push(watcher);

	function updateTree() {
		tree.refresh();
	}
	const updateTreeDebounced = debounce(updateTree, 600);


	function debounce<Params extends any[]>(
		func: (...args: Params) => any,
		timeout: number,
	): (...args: Params) => void {
		let timer: NodeJS.Timeout
		return (...args: Params) => {
			clearTimeout(timer)
			timer = setTimeout(() => {
				func(...args)
			}, timeout)
		}
	}
}

