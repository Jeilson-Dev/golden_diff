import * as vscode from 'vscode';
import { failuressNameSpace as failuresNameSpace } from './failure/tree_failures_view';
import { goldensNameSpace as goldensNameSpace } from './golden/tree_goldens_view';


export function activate(context: vscode.ExtensionContext) {

	let treeFailures = new failuresNameSpace.TreeFailureView();
	let treeGoldens = new goldensNameSpace.TreeGoldenView();
	vscode.window.registerTreeDataProvider('golden_failures', treeFailures);
	vscode.window.registerTreeDataProvider('golden_library', treeGoldens);
	treeFailures.refresh();
	treeGoldens.refresh();

	const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
	if (workspaceRoot) {


		const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workspaceRoot, '**/*'));

		watcher.onDidChange((e: vscode.Uri) => {
			const filePath = e.fsPath;
			if (filePath.includes('test/golden_test/failures')) updateFailureTreeDebounced();
			if (filePath.includes('test/golden_test/goldens')) updateGoldenTreeDebounced();
		});

		watcher.onDidCreate((e: vscode.Uri) => {
			const filePath = e.fsPath;
			if (filePath.includes('test/golden_test/failures')) updateFailureTreeDebounced();
			if (filePath.includes('test/golden_test/goldens')) updateGoldenTreeDebounced();
		});

		watcher.onDidDelete((e: vscode.Uri) => {
			const filePath = e.fsPath;
			if (filePath.includes('test/golden_test/failures')) updateFailureTreeDebounced();
			if (filePath.includes('test/golden_test/goldens')) updateGoldenTreeDebounced();
		});


		context.subscriptions.push(watcher);
	}
	function updateFailureTree() { treeFailures.refresh(); }
	function updateGoldenTree() { treeGoldens.refresh(); }

	const updateFailureTreeDebounced = debounce(updateFailureTree, 600);
	const updateGoldenTreeDebounced = debounce(updateGoldenTree, 600);


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

