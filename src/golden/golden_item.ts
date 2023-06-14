import * as vscode from 'vscode';
const sizeOf = require('image-size');
const fs = require('fs');

export class GoldenItem extends vscode.TreeItem {
    readonly label: string;
    readonly imageFolder: string;
    readonly image: string;
    readonly width: number;
    readonly height: number;
    public children: GoldenItem[];

    constructor(label: string, imageFolder: string, image: string, width: number, height: number) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.imageFolder = imageFolder;
        this.image = image;
        this.width = width;
        this.height = height;
        this.children = [];
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    }


}
