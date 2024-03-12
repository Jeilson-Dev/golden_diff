import path from 'path';
import * as vscode from 'vscode';
const sizeOf = require('image-size');
const fs = require('fs');

import { GoldenFailureItem } from './golden_failure_item';

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
          const firstItem = failuresFolder[0]?.path || '';
          const failureFolder = this._removeLastPart(firstItem);

          if (failureFolder.includes(projectFolder)) {
            let projectFolder = project.path.replace('pubspec.yaml', '');
            this.projectsData.push(new GoldenFailureItem(path.basename(projectFolder), failureFolder, '', '', '', '', 0, 0, vscode.TreeItemCollapsibleState.Collapsed));
          }
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
      panel.webview.html = `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    /* tabView style */
                    .tab {
                        overflow: hidden;
                        background-color: #f1f1f1;
                    }

                    /* tab style */
                    .tab button {
                        background-color: inherit;
                        float: left;
                        border: none;
                        outline: none;
                        cursor: pointer;
                        padding: 14px 16px;
                        transition: 0.3s;
                    }

                    /* tab selected background */
                    .tab button.active {
                        background-color: #ccc;
                    }

                    /* tab content style */
                    .tabContent {
                        display: none;
                        padding: 6px 12px;
                        border: 1px solid #ccc;
                        border-top: none;
                    }

                    section div:first-child {
                        width: ${item.width}px;
                        height: ${item.height}px;
                        background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMaster!))}');
                        background-repeat: no-repeat;
                        background-size: ${item.width}px ${item.height}px ;
                        position: relative;
                    }
            
                    section div:last-child {
                        border-right: solid;
                        border-color: crimson;
                        border-width: 1px;
                        width: ${item.width}px;
                        height: ${item.height}px;
                        margin-top: -${item.height}px;
                        margin-left: 0px;
                        background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageFailure!))}');
                        background-repeat: no-repeat;
                        background-size: ${item.width}px ${item.height}px;
                        position: relative;
                    }
        
                    .slider-width100 {
                        width: ${item.width}px;
                    }

                    @media screen and (-webkit-min-device-pixel-ratio:0) {
                        input[type='range'] {
                          overflow: hidden;
                          width: ${item.width}px;
                          -webkit-appearance: none;
                          background-color: #51e312;
                        }
                        
                        input[type='range']::-webkit-slider-runnable-track {
                          height: 10px;
                          -webkit-appearance: none;
                          color: #cc0000;
                          margin-top: -1px;
                        }
                        
                        input[type='range']::-webkit-slider-thumb {
                          width: 10px;
                          -webkit-appearance: none;
                          height: 10px;
                          cursor: ew-resize;
                          background: #434343;
                          box-shadow: -${item.width}px 0 0 ${item.width}px #cc0000;
                        }
                    
                    }
                </style>
               
            </head>

            <body>
            <h3>${item.label} </h3>
            
                <div class="tab">
                    <button class="tabinks"  id="firstTab" onclick="openTab(event, 'Tab1')">Diff [Test < > Master]<br>Hover To Compare</button>
                    <button class="tabinks" onclick="openTab(event, 'Tab2')">Test Image<br>[Failure]</button>
                    <button class="tabinks" onclick="openTab(event, 'Tab3')">Master Image<br>[Expect]</button>
                    <button class="tabinks" onclick="openTab(event, 'Tab4')">Isolated Image<br>&nbsp</button>
                    <button class="tabinks" onclick="openTab(event, 'Tab5')">Masked Image<br>&nbsp</button>
                   

                    
                </div>

                <div id="Tab1" class="tabContent">
                    <section>
                        <div></div>
                        <div id="last" style="${item.width}px;"></div>
                    </section>
                    <br>
                    <input id="slider" class="slider-width100" type="range" oninput="changeWidth(this.value)" min="0" max="100" value="100">
                </div>

                <div id="Tab2" class="tabContent">
                    <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageFailure!))}');  
                        width: ${item.width}px;
                        height: ${item.height}px;
                        background-repeat: no-repeat;
                        background-size:  ${item.width}px ${item.height}px;" >
                    </div>
                    <div style="height: 37px;"></div>
                </div>

                <div id="Tab3" class="tabContent">
                <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMaster!))}');  
                width: ${item.width}px;
                    height: ${item.height}px;
                    background-repeat: no-repeat;
                    background-size:  ${item.width}px ${item.height}px;" >
                </div>
                <div style="height: 37px;"></div>
                </div>
               
                <div id="Tab4" class="tabContent">
                <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageIsolated!))}');  
                width: ${item.width}px;
                height: ${item.height}px;
                background-repeat: no-repeat;
                background-size:  ${item.width}px ${item.height}px;" >
                </div>
                <div style="height: 37px;"></div>
                </div>
               
                <div id="Tab5" class="tabContent">
                <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMasked!))}');  
                width: ${item.width}px;
                height: ${item.height}px;
                background-repeat: no-repeat;
                background-size:  ${item.width}px ${item.height}px;" >
                </div>
                <div style="height: 37px;"></div>
                </div>

                <script>
                    function openTab(evt, tabName) {
                        var i, tabContent, tabinks;
                        tabContent = document.getElementsByClassName("tabContent");
                        for (i = 0; i < tabContent.length; i++) {
                            tabContent[i].style.display = "none";
                        }
                        tabinks = document.getElementsByClassName("tabinks");
                        for (i = 0; i < tabinks.length; i++) {
                            tabinks[i].className = tabinks[i].className.replace(" active", "");
                        }
                        document.getElementById(tabName).style.display = "block";
                        evt.currentTarget.className += " active";
                    }

                    document.getElementsByClassName("tabinks")[0].click();

                    const input = document.querySelector("#slider")
                    input.addEventListener("input", (event) => document.querySelector("#last").style.width = ${item.width}/100 * event.target.value  + 'px');
                    
                    const firstTab = document.querySelector("#firstTab");

                    firstTab.addEventListener('mouseenter', () => {
                        document.querySelector("#last").style.width='0px';
                        document.querySelector("#slider").value=0;
                      });
                      
                      firstTab.addEventListener('mouseleave', () => {
                        document.querySelector("#last").style.width='${item.width}px';
                        document.querySelector("#slider").value=100;
                      });

                </script>

            </body>
    
            </html>`;
    }
  }
}