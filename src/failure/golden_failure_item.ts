import * as vscode from 'vscode';
const sizeOf = require('image-size');
const fs = require('fs');

export class GoldenFailureItem extends vscode.TreeItem {
    readonly label: string;
    readonly failureFolder: string;
    readonly imageMaster: string;
    readonly imageFailure: string;
    readonly imageIsolated: string;
    readonly imageMasked: string;
    readonly width: number;
    readonly height: number;

    public children: GoldenFailureItem[];

    constructor(label: string, failureFolder: string, imageMaster: string, imageFailure: string, imageIsolated: string, imageMasked: string, width: number, height: number) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.failureFolder = failureFolder;
        this.imageMaster = imageMaster;
        this.imageFailure = imageFailure;
        this.imageIsolated = imageIsolated;
        this.imageMasked = imageMasked;
        this.width = width;
        this.height = height;
        this.children = [];
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    }


}
