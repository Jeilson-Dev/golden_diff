import * as vscode from 'vscode';
const sizeOf = require('image-size');
const fs = require('fs');
import path from 'path';

import { GoldenItem } from '../golden/golden_item';

export namespace goldensNameSpace {
    export class TreeGoldenView implements vscode.TreeDataProvider<GoldenItem> {

        projectsData: GoldenItem[] = [];
        isRefreshing = false;
        private onDidChangeGoldenTreeData: vscode.EventEmitter<GoldenItem | undefined> = new vscode.EventEmitter<GoldenItem | undefined>();

        readonly onDidChangeTreeData?: vscode.Event<GoldenItem | undefined> = this.onDidChangeGoldenTreeData.event;

        constructor() {
            vscode.commands.registerCommand('golden.itemClicked', item => this.itemClicked(item));
            vscode.commands.registerCommand('goldens.refresh', () => this.isRefreshing ? undefined : this.refresh());
            vscode.commands.registerCommand('goldens.openLibrary', () => this.openLibrary(this.projectsData));

        }
        public getTreeItem(element: GoldenItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
            const item = new vscode.TreeItem(element.label!, element.collapsibleState);
            item.command = element.imageFolder == '' ? { command: 'golden.itemClicked', title: 'element', arguments: [element] } : undefined;
            return item;
        }

        public getChildren(element: GoldenItem | undefined): vscode.ProviderResult<GoldenItem[]> {
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


        public async getProjects() {
            const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

            let projectsPattern = '**/pubspec.yaml';
            const excludePattern = '**/{ios,macos,windows,android,linux,.*}/**';

            if (!workspaceRoot) { vscode.window.showInformationMessage('Its an empty workspace'); }

            else {

                const projectsFolder = await vscode.workspace.findFiles(projectsPattern, excludePattern);

                await Promise.all(projectsFolder.map(async (project) => {
                    let goldenFolder = project.path.replace('pubspec.yaml', 'test/golden_test/goldens');
                    if (fs.existsSync(goldenFolder)) {
                        let projectFolder = project.path.replace('pubspec.yaml', '');
                        this.projectsData.push(new GoldenItem(path.basename(projectFolder), goldenFolder, '', 0, 0, vscode.TreeItemCollapsibleState.Collapsed));
                    }
                }
                ));
                this.projectsData.map(async (project) => { await this.getGoldens(project); });
                this.projectsData.sort((projectA, projectB) => projectA.label.localeCompare(projectB.label));
            }
        }

        public async getGoldens(project: GoldenItem) {

            const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

            if (!workspaceRoot) { vscode.window.showInformationMessage('Its an empty workspace'); }

            else {

                let filePattern = '**/*.png';
                const excludePattern = '**/{ios,macos,windows,android,linux,.*}/**';

                let goldens = await vscode.workspace.findFiles(filePattern, excludePattern);
                let fileNames = goldens.filter(file => {
                    const filePath = file.fsPath;
                    const fileFolderPath = path.dirname(filePath);
                    if (filePath.includes('test/golden_test'))
                        return fileFolderPath === project.imageFolder;
                });

                await Promise.all(fileNames.map(async (goldenImage) => {
                    let width, height;
                    try {
                        const data = await fs.promises.readFile(goldenImage.path);
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

                    let labelArray = goldenImage.path.split('/');
                    let label = labelArray[labelArray.length - 1].replace('.png', '');
                    let image = goldenImage.path;
                    return project.children.push(new GoldenItem(label, '', image, width, height, vscode.TreeItemCollapsibleState.None));

                }));

            }
            project.children.sort((imageA, imageB) => imageA.label.localeCompare(imageB.label));
        }
        itemClicked(item: GoldenItem) {
            const panel = vscode.window.createWebviewPanel(item.label!, item.label!, vscode.ViewColumn.One, { enableScripts: true });
            panel.webview.html = `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        section div:first-child {
                            width: ${item.width}px;
                            height: ${item.height}px;
                            background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.image!))}');
                            background-repeat: no-repeat;
                            background-size: ${item.width}px ${item.height}px ;
                           
                        }
                    </style>
                </head>
                <body>
                    <section>
                        <div id="last"></div>
                    </section>
                    <br>
                </body>
    
            </html>`;
        }

        openLibrary(library: GoldenItem[]) {
            if (library.length == 0) return;
            const panel = vscode.window.createWebviewPanel('', 'Golden Library', vscode.ViewColumn.One, { enableScripts: true });
            let html = `<head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                .collapsible {
                background-color: #777;
                color: white;
                cursor: pointer;
                padding: 18px;
                width: 100%;
                border: none;
                text-align: left;
                outline: none;
                font-size: 15px;
                }
                
                .active, .collapsible:hover {
                background-color: #555;
                }
                
                .content {
                padding: 0 18px;
                display: none;
                overflow: hidden;
                background-color: #333;
                }
                </style>

            </head>`;

            for (const project of library) {
                html += `
                <button type="button" class="collapsible">${project.label} - ${project.children.length} Goldens</button>
                <div class="content">
                `;
                for (const golden of project.children) {
                    html += `
                    <h4>${golden.label}</h4>
                    <div style="width: ${golden.width * 0.7}px;
                        height: ${golden.height * 0.7}px; 
                        background: url('${panel.webview.asWebviewUri(vscode.Uri.file(golden.image))}');
                        background-repeat: no-repeat;
                        background-size: ${golden.width * 0.7}px ;"></div>`;
                }
                html += `
                </div>
                </div>`;
            }
            html += `<script>
            var coll = document.getElementsByClassName("collapsible");
            var i;

            for (i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.display === "block") {
                content.style.display = "none";
                } else {
                content.style.display = "block";
                }
            });
            }
        </script>`;
            panel.webview.html = html;


            `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        section div:first-child {
                            
                        }
                    </style>
                </head>
                <body>
                    <section>
                        
                    </section>
                    <br>
                </body>
    
            </html>`
        }
    }

}