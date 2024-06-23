import * as vscode from 'vscode';
import { failuresNameSpace } from './failure/tree_failures_view';
import { goldensNameSpace } from './golden/tree_goldens_view';

export function activate(context: vscode.ExtensionContext) {

  let badgeCounter = 0;
  const treeFailures = new failuresNameSpace.TreeFailureView();
  const treeGoldens = new goldensNameSpace.TreeGoldenView();
  vscode.window.registerTreeDataProvider('goldenFailures', treeFailures);
  vscode.window.registerTreeDataProvider('goldenLibrary', treeGoldens);

  treeFailures.refresh();
  treeGoldens.refresh();

  const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
  if (workspaceRoot) {

    const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workspaceRoot, '**/*'));

    const goldenFailuresTreeView = vscode.window.createTreeView( "goldenFailures", { treeDataProvider: treeFailures } );

    /**
     * A function that refreshes on a specific event.
     *
     * @param {vscode.Uri} event - the event triggering the refresh
     */
    const refreshOnEvent = (event: vscode.Uri) => {
      badgeCounter = 0;
      const filePath = event.fsPath;
      
      if (filePath.includes('/failures')) updateFailureTreeDebounced();
      if (filePath.includes('/goldens')) updateGoldenTreeDebounced();
     
      treeFailures.projectsData.map((project)=> badgeCounter+= project.children.length)
      goldenFailuresTreeView.badge={value:badgeCounter,tooltip:''};
    };

    watcher.onDidChange(refreshOnEvent);
    watcher.onDidCreate(refreshOnEvent);
    watcher.onDidDelete(refreshOnEvent);


    context.subscriptions.push(watcher);
  }

  function updateFailureTree() { treeFailures.refresh(); }
  function updateGoldenTree() { treeGoldens.refresh(); }

  const updateFailureTreeDebounced = debounce(updateFailureTree, 600);
  const updateGoldenTreeDebounced = debounce(updateGoldenTree, 600);

  /**
   * Debounces a function by delaying its execution until after a specified amount of time has passed since the last time it was invoked.
   *
   * @param {(...args: Params) => any} func - The function to be debounced.
   * @param {number} timeout - The amount of time to wait before executing the debounced function.
   * @return {(...args: Params) => void} A debounced function.
   */
  function debounce<Params extends any[]>(
    func: (...args: Params) => any, timeout: number): (...args: Params) => void {
    let timer: NodeJS.Timeout
    return (...args: Params) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        func(...args)
      }, timeout)
    }
  }
}

