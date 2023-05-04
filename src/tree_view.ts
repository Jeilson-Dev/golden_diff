import * as vscode from 'vscode';

export namespace goldesNameSpace {

    class GoldenItem extends vscode.TreeItem {
        readonly label: string | undefined;
        readonly imageMastered: string | undefined;
        readonly imageFailure: string | undefined;

        public children: GoldenItem[] | undefined;

        constructor(label: string, imageMastered: string, imageFailure: string) {
            super(label, vscode.TreeItemCollapsibleState.None);
            this.imageMastered = imageMastered;
            this.imageFailure = imageFailure;
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
                    let imageMastered = failureImage.path.replace('_testImage.png', '_masterImage.png');
                    return this.goldenData.push(new GoldenItem(label, imageMastered, imageFailure));
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
                <title>Golden Diff</title>
        
                <style type="text/css">
                    section div:first-child {
                        width: 1000px;
                        height: 600px;
                        background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMastered!))}');
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
                <section>
                    <div></div>
                    <div id="last" style="width: 1000px;"></div>
                </section>
                <br>
                <input id="slider" class="slider-width100" type="range" oninput="changeWidth(this.value)" min="0" max="100" value="100">
            
                <script>
                    const input = document.querySelector("#slider")
                    input.addEventListener("input", (event) => {
                        console.log(event.target.value);
                        document.querySelector("#last").style.width = event.target.value * 10 + 'px';
                    })
                    function changeWidth(width) {}
                </script>
            </body>
            </html>`;
        }
    }
}