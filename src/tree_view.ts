import * as vscode from 'vscode';

export namespace goldesNameSpace {

    class GoldenItem extends vscode.TreeItem {
        readonly label: string | undefined;
        readonly imageMaster: string | undefined;
        readonly imageFailure: string | undefined;
        readonly imageIsolated: string | undefined;
        readonly imageMasked: string | undefined;

        public children: GoldenItem[] | undefined;

        constructor(label: string, imageMaster: string, imageFailure: string, imageIsolated: string, imageMasked: string) {
            super(label, vscode.TreeItemCollapsibleState.None);
            this.imageMaster = imageMaster;
            this.imageFailure = imageFailure;
            this.imageIsolated = imageIsolated;
            this.imageMasked = imageMasked;
            this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        }


    }

    export class TreeGoldenView implements vscode.TreeDataProvider<GoldenItem>
    {
        goldenData: GoldenItem[] = [];

        private onDidChangeGoldenTreeData: vscode.EventEmitter<GoldenItem | undefined> = new vscode.EventEmitter<GoldenItem | undefined>();

        readonly onDidChangeTreeData?: vscode.Event<GoldenItem | undefined> = this.onDidChangeGoldenTreeData.event;

        constructor() {
            vscode.commands.registerCommand('golden_failures.itemClicked', r => this.itemClicked(r));
            vscode.commands.registerCommand('golden_failures.refresh', () => this.refresh());
        }
        public getTreeItem(element: GoldenItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
            const item = new vscode.TreeItem(element.label!, element.collapsibleState);
            item.command = { command: 'golden_failures.itemClicked', title: 'element', arguments: [element] };
            return item;
        }

        public getChildren(element: GoldenItem | undefined): vscode.ProviderResult<GoldenItem[]> {
            if (element === undefined) { return this.goldenData; }
            else { return element.children; }
        }

        public async refresh() {
            if (vscode.workspace.workspaceFolders) {
                this.goldenData = [];
                await this.getGoldens();
                this.onDidChangeGoldenTreeData.fire(undefined);
            }
        }

        public async getGoldens() {
            const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

            let filePattern = '**/*_testImage.png';

            if (!workspaceRoot) { vscode.window.showInformationMessage('Its an empty workspace'); }

            else {
                let fileNames = await vscode.workspace.findFiles(filePattern);
                fileNames.map((failureImage) => {
                    let labelArray = failureImage.path.split('/');
                    let label = labelArray[labelArray.length - 1].replace('_testImage.png', '');
                    let imageFailure = failureImage.path;
                    let imageMaster = failureImage.path.replace('_testImage.png', '_masterImage.png');
                    let imageIsolated = failureImage.path.replace('_testImage.png', '_isolatedDiff.png');
                    let imageMasked = failureImage.path.replace('_testImage.png', '_maskedDiff.png');
                    return this.goldenData.push(new GoldenItem(label, imageMaster, imageFailure, imageIsolated, imageMasked));
                });
            }
        }
        itemClicked(item: GoldenItem) {
            const panel = vscode.window.createWebviewPanel('showDiff', item.label!, vscode.ViewColumn.One, { enableScripts: true });
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

                    /* tbb style */
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
                        width: 1000px;
                        height: 600px;
                        background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMaster!))}');
                        background-repeat: no-repeat;
                        background-size: 1000px 600px;
                        position: relative;
                    }
            
                    section div:last-child {
                        border-right: solid;
                        border-color: crimson;
                        border-width: 1px;
                        width: 1000px;
                        height: 600px;
                        margin-top: -600px;
                        margin-left: 0px;
                        background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageFailure!))}');
                        background-repeat: no-repeat;
                        background-size: 1000px 600px;
                        position: relative;
                    }
        
                    .slider-width100 {
                        width: 1000px;
                    }
                </style>
            </head>

            <body>

                <div class="tab">
                    <button class="tablinks" onclick="openTab(event, 'Tab1')">Compare (Test - Master)</button>
                    <button class="tablinks" onclick="openTab(event, 'Tab2')">Test Image</button>
                    <button class="tablinks" onclick="openTab(event, 'Tab3')">Master Image</button>
                    <button class="tablinks" onclick="openTab(event, 'Tab4')">Isolated Image</button>
                    <button class="tablinks" onclick="openTab(event, 'Tab5')">Masked Image</button>
                </div>

                <div id="Tab1" class="tabcontent">
                    <section>
                        <div></div>
                        <div id="last" style="width: 1000px;"></div>
                    </section>
                    <br>
                    <input id="slider" class="slider-width100" type="range" oninput="changeWidth(this.value)" min="0" max="100" value="100">
        
                </div>

                <div id="Tab2" class="tabcontent">
                    <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageFailure!))}');  
                    width: 1000px;
                    height: 600px;
                    background-repeat: no-repeat;
                    background-size: 1000px 600px;" >
                    </div>
                    <div style="height: 37px;"></div>
                    
                </div>

                <div id="Tab3" class="tabcontent">
                <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMaster!))}');  
                width: 1000px;
                height: 600px;
                background-repeat: no-repeat;
                background-size: 1000px 600px;" >
                </div>
                <div style="height: 37px;"></div>
                </div>
               
                <div id="Tab4" class="tabcontent">
                <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageIsolated!))}');  
                width: 1000px;
                height: 600px;
                background-repeat: no-repeat;
                background-size: 1000px 600px;" >
                </div>
                <div style="height: 37px;"></div>
                </div>
               
                <div id="Tab5" class="tabcontent">
                <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMasked!))}');  
                width: 1000px;
                height: 600px;
                background-repeat: no-repeat;
                background-size: 1000px 600px;" >
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
                    input.addEventListener("input", (event) => document.querySelector("#last").style.width = event.target.value * 10 + 'px');
                    
                    const element = document.querySelector("#last");

                    element.addEventListener('mouseenter', () => {
                        document.querySelector("#last").style.width='0px';
                        document.querySelector("#slider").value=0;
                      });
                      
                      element.addEventListener('mouseleave', () => {
                        document.querySelector("#last").style.width='1000px';
                        document.querySelector("#slider").value=100;


                      });

                </script>

            </body>
    
            </html>`;
        }
    }
}