import path from 'path';
import * as vscode from 'vscode';
import { GoldenFailureItem } from './golden_failure_item';
import { FailureHtml } from './src/failure_html';
const sizeOf = require('image-size');
const fs = require('fs');

export namespace failuresNameSpace {
  export class TreeFailureView implements vscode.TreeDataProvider<GoldenFailureItem> {

    isRefreshing = false;
    projectsData: GoldenFailureItem[] = [];

    constructor() {
      vscode.commands.registerCommand('goldenFailures.itemClicked', item => this.itemClicked(item));
      vscode.commands.registerCommand('goldenFailures.refresh', () => this.isRefreshing ? undefined : this.refresh());
      vscode.commands.registerCommand('goldenFailures.clear', () => this.clearGoldenFailures());
    }

    private onDidChangeGoldenTreeData: vscode.EventEmitter<GoldenFailureItem | undefined> = new vscode.EventEmitter<GoldenFailureItem | undefined>();

    readonly onDidChangeTreeData?: vscode.Event<GoldenFailureItem | undefined> = this.onDidChangeGoldenTreeData.event;

    /**
     * Get the tree item for the given element.
     *
     * @param {GoldenFailureItem} element - the element for which to get the tree item
     * @return {vscode.TreeItem | Thenable<vscode.TreeItem>} the tree item for the given element
     */
    public getTreeItem(element: GoldenFailureItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
      const item = new vscode.TreeItem(element.label!, element.collapsibleState);
      item.command = element.failureFolder == '' ? { command: 'goldenFailures.itemClicked', title: 'element', arguments: [element] } : undefined;
      return item;
    }

    /**
     * Get the children of the Project.
     *
     * @param {GoldenFailureItem | undefined} element - the element to retrieve children for
     * @return {vscode.ProviderResult<GoldenFailureItem[]>} the children of the given element
     */
    public getChildren(element: GoldenFailureItem | undefined): vscode.ProviderResult<GoldenFailureItem[]> {
      if (element === undefined) { return this.projectsData; }
      else { return element.children; }
    }

    /**
     * A function to refresh the items.
     *
     * @return {Promise<void>} Promise that resolves when the data is refreshed
     */
    public async refresh() {
      this.isRefreshing = true;
      if (vscode.workspace.workspaceFolders) {
        this.onDidChangeGoldenTreeData.fire(undefined);
        this.projectsData = [];
        await this.getProjects();
        this.onDidChangeGoldenTreeData.fire(undefined);
      }
      this.isRefreshing = false;
    }

    /**
     * Clear golden failures for all projects.
     *
     * @return {Promise<void>} A Promise that resolves when the function is completed
     */
    public async clearGoldenFailures() {

      await this.projectsData.map(async (project) => {
        try {
          const uri = vscode.Uri.file(project.failureFolder);
          const folderExists = await vscode.workspace.fs.stat(uri);
          if (folderExists.type === vscode.FileType.Directory) {
            vscode.workspace.fs.delete(uri, { recursive: true });
          }
        } catch (error) {
          console.error('Get some error on clear');
        }
      });
      this.refresh();
    }

    /**
     * Retrieves a list of projects within the workspace and initializes projectsData.
     */
    public async getProjects() {
      const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

      let patternToFindProjects = '**/pubspec.yaml';
      const ignoreFolder = '**/{ios,macos,windows,android,linux,.*}/**';

      if (!workspaceRoot) { vscode.window.showInformationMessage('Its an empty workspace'); }

      else {

        const projectsFoundList = await vscode.workspace.findFiles(patternToFindProjects, ignoreFolder);

        await Promise.all(projectsFoundList.map(async (project) => {
          const projectFolder = project.path.replace('pubspec.yaml', '');
          const failuresFolder = await vscode.workspace.findFiles('**/failures/*_testImage.png', ignoreFolder);
          failuresFolder.map(async (firstItem) => {
            const failureFolder = this._removeLastPart(firstItem.path);
            if (failureFolder.includes(projectFolder)) {
              let projectFolder = project.path.replace('pubspec.yaml', '');
              this.projectsData.push(new GoldenFailureItem(path.basename(projectFolder), failureFolder, '', '', '', '', 0, 0, vscode.TreeItemCollapsibleState.Collapsed));
            }
          })


        }
        ));
        this.projectsData.map(async (project) => {
          await this.getGoldens(project);
        });

        this.projectsData.sort((projectA, projectB) => projectA.label.localeCompare(projectB.label));
      }
    }

    /**
     * Retrieves the golden images for the given project and updates the project's children.
     *
     * @param {GoldenFailureItem} project - the project for which to retrieve golden images
     * @return {void} 
     */
    public async getGoldens(project: GoldenFailureItem) {
      const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

      if (!workspaceRoot) { vscode.window.showInformationMessage('Its an empty workspace'); }

      else {
        let filePattern = '**/failures/*_testImage.png';
        let failures = await vscode.workspace.findFiles(filePattern);
        let fileNames = failures.filter(file => {
          const filePath = file.fsPath;
          const fileFolderPath = path.dirname(filePath);
          return fileFolderPath.includes(project.failureFolder);
        });

        await Promise.all(fileNames.map(async (failureImage) => {
          let width, height;
          try {
            const data = await fs.promises.readFile(failureImage.path);
            const dimensions = sizeOf(data);
            const originalWidth = dimensions.width;
            const originalHeight = dimensions.height;
            const maxWidth = 1000;
            const maxHeight = 700;
            const originalRatio = originalWidth / originalHeight;


            if (originalWidth > maxWidth) {
              width = maxWidth;
              height = Math.round(width / originalRatio);
              if (height > maxHeight) {
                height = maxHeight;
                width = Math.round(height * originalRatio);
              }
            }

            else if (originalHeight > maxHeight) {
              height = maxHeight;
              width = Math.round(height * originalRatio);
              if (width > maxWidth) {
                width = maxWidth;
                height = Math.round(width / originalRatio);
              }
            }

            else {
              width = originalWidth;
              height = originalHeight;
            }

          } catch (err) {
            console.error('Fail to read file:', err);
          }

          let labelArray = failureImage.path.split('/');
          let label = labelArray[labelArray.length - 1].replace('_testImage.png', '');
          let imageFailure = failureImage.path;
          let imageMaster = failureImage.path.replace('_testImage.png', '_masterImage.png');
          let imageIsolated = failureImage.path.replace('_testImage.png', '_isolatedDiff.png');
          let imageMasked = failureImage.path.replace('_testImage.png', '_maskedDiff.png');
          return project.children.push(new GoldenFailureItem(label, '', imageMaster, imageFailure, imageIsolated, imageMasked, width, height, vscode.TreeItemCollapsibleState.None));
        }));

      }
      project.children.sort((failureA, failureB) => failureA.label.localeCompare(failureB.label));
    }

    /**
     * Remove the last part of the input string if it contains a slash.
     *
     * @param {string} input - the input string
     * @return {string} the modified input string
     */
    _removeLastPart(input: string): string {
      const lastSlashIndex = input.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        return input.substring(0, lastSlashIndex);
      }
      return input;
    }


    /**
     * Handles the click event of the item.
     *
     * @param {GoldenFailureItem} item - the item that was clicked
     */
    itemClicked(item: GoldenFailureItem) {
      const panel = vscode.window.createWebviewPanel(item.label!, item.label!, vscode.ViewColumn.Active, { enableScripts: true });
      panel.webview.html = FailureHtml.html(item, panel);
    }
  }
}