import * as vscode from 'vscode';
const sizeOf = require('image-size');
const fs = require('fs');
import path from 'path';

import { GoldenFailureItem } from './golden_failure_item';

export namespace failuressNameSpace {
    export class TreeFailureView implements vscode.TreeDataProvider<GoldenFailureItem> {

        projectsData: GoldenFailureItem[] = [];
        isRefreshing = false;
        private onDidChangeGoldenTreeData: vscode.EventEmitter<GoldenFailureItem | undefined> = new vscode.EventEmitter<GoldenFailureItem | undefined>();

        readonly onDidChangeTreeData?: vscode.Event<GoldenFailureItem | undefined> = this.onDidChangeGoldenTreeData.event;

        constructor() {
            vscode.commands.registerCommand('golden_failures.itemClicked', item => this.itemClicked(item));
            vscode.commands.registerCommand('golden_failures.refresh', () => this.isRefreshing ? undefined : this.refresh());
            vscode.commands.registerCommand('golden_failures.clear', () => this.clearGoldenFailures());

        }
        public getTreeItem(element: GoldenFailureItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
            const item = new vscode.TreeItem(element.label!, element.collapsibleState);
            item.command = element.failureFolder == '' ? { command: 'golden_failures.itemClicked', title: 'element', arguments: [element] } : undefined;
            return item;
        }

        public getChildren(element: GoldenFailureItem | undefined): vscode.ProviderResult<GoldenFailureItem[]> {
            if (element === undefined) { return this.projectsData; }
            else { return element.children; }
        }

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

        public async clearGoldenFailures() {

            await this.projectsData.map(async (project) => {
                try {
                    const uri = vscode.Uri.file(project.failureFolder);
                    const folderExists = await vscode.workspace.fs.stat(uri);
                    if (folderExists.type === vscode.FileType.Directory) {
                        await vscode.workspace.fs.delete(uri, { recursive: true });
                    }
                } catch (error) {
                    console.error('Get some error on clear');
                }
            });
            this.refresh();
        }

        public async getProjects() {
            const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

            let projectsPattern = '**/pubspec.yaml';
            const excludePattern = '**/{ios,macos,windows,android,linux,.*}/**';

            if (!workspaceRoot) { vscode.window.showInformationMessage('Its an empty workspace'); }

            else {

                const projectsFolder = await vscode.workspace.findFiles(projectsPattern, excludePattern);

                await Promise.all(projectsFolder.map(async (project) => {
                    let failuresFolder = project.path.replace('pubspec.yaml', 'test/golden_test/failures');
                    if (fs.existsSync(failuresFolder)) {
                        let projectFolder = project.path.replace('pubspec.yaml', '');
                        this.projectsData.push(new GoldenFailureItem(path.basename(projectFolder), failuresFolder, '', '', '', '', 0, 0, vscode.TreeItemCollapsibleState.Expanded));
                    }
                }
                ));
                this.projectsData.map(async (project) => {
                    await this.getGoldens(project);
                });

                this.projectsData.sort((projectA, projectB) => projectA.label.localeCompare(projectB.label));
            }
        }

        public async getGoldens(project: GoldenFailureItem) {
            const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

            if (!workspaceRoot) { vscode.window.showInformationMessage('Its an empty workspace'); }

            else {
                let filePattern = '**/*_testImage.png';
                let failures = await vscode.workspace.findFiles(filePattern);
                let fileNames = failures.filter(file => {
                    const filePath = file.fsPath;
                    const fileFolderPath = path.dirname(filePath);
                    return fileFolderPath === project.failureFolder;
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
        itemClicked(item: GoldenFailureItem) {
            const panel = vscode.window.createWebviewPanel(item.label!, item.label!, vscode.ViewColumn.One, { enableScripts: true });
            panel.webview.html = `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    /* tabview style */
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
                    .tabcontent {
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

                <div class="tab">
                    <button class="tablinks"  id="firstTab" onclick="openTab(event, 'Tab1')">Diff [Test < > Master]<br>Hover To Compare</button>
                    <button class="tablinks" onclick="openTab(event, 'Tab2')">Test Image<br>[Failure]</button>
                    <button class="tablinks" onclick="openTab(event, 'Tab3')">Master Image<br>[Expect]</button>
                    <button class="tablinks" onclick="openTab(event, 'Tab4')">Isolated Image<br>&nbsp</button>
                    <button class="tablinks" onclick="openTab(event, 'Tab5')">Masked Image<br>&nbsp</button>
                </div>

                <div id="Tab1" class="tabcontent">
                    <section>
                        <div></div>
                        <div id="last" style="${item.width}px;"></div>
                    </section>
                    <br>
                    <input id="slider" class="slider-width100" type="range" oninput="changeWidth(this.value)" min="0" max="100" value="100">
                </div>

                <div id="Tab2" class="tabcontent">
                    <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageFailure!))}');  
                        width: ${item.width}px;
                        height: ${item.height}px;
                        background-repeat: no-repeat;
                        background-size:  ${item.width}px ${item.height}px;" >
                    </div>
                    <div style="height: 37px;"></div>
                </div>

                <div id="Tab3" class="tabcontent">
                <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMaster!))}');  
                width: ${item.width}px;
                    height: ${item.height}px;
                    background-repeat: no-repeat;
                    background-size:  ${item.width}px ${item.height}px;" >
                </div>
                <div style="height: 37px;"></div>
                </div>
               
                <div id="Tab4" class="tabcontent">
                <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageIsolated!))}');  
                width: ${item.width}px;
                height: ${item.height}px;
                background-repeat: no-repeat;
                background-size:  ${item.width}px ${item.height}px;" >
                </div>
                <div style="height: 37px;"></div>
                </div>
               
                <div id="Tab5" class="tabcontent">
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
                        var i, tabcontent, tablinks;
                        tabcontent = document.getElementsByClassName("tabcontent");
                        for (i = 0; i < tabcontent.length; i++) {
                            tabcontent[i].style.display = "none";
                        }
                        tablinks = document.getElementsByClassName("tablinks");
                        for (i = 0; i < tablinks.length; i++) {
                            tablinks[i].className = tablinks[i].className.replace(" active", "");
                        }
                        document.getElementById(tabName).style.display = "block";
                        evt.currentTarget.className += " active";
                    }

                    document.getElementsByClassName("tablinks")[0].click();

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