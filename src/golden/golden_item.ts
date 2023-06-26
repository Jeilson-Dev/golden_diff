import * as vscode from 'vscode';

export class GoldenItem extends vscode.TreeItem {
    readonly label: string;
    readonly imageFolder: string;
    readonly image: string;
    readonly width: number;
    readonly height: number;
    public children: GoldenItem[];
    public collapsibleState: vscode.TreeItemCollapsibleState;

    constructor(label: string, imageFolder: string, image: string, width: number, height: number, collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.imageFolder = imageFolder;
        this.image = image;
        this.width = width;
        this.height = height;
        this.children = [];
        this.collapsibleState = collapsibleState;
    }


}
