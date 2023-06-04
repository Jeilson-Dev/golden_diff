import * as vscode from 'vscode';
const sizeOf = require('image-size');
const fs = require('fs');

export class GoldenItem extends vscode.TreeItem {
    readonly label: string | undefined;
    readonly imageMaster: string | undefined;
    readonly imageFailure: string | undefined;
    readonly imageIsolated: string | undefined;
    readonly imageMasked: string | undefined;
    readonly width: number | undefined;
    readonly height: number | undefined;

    public children: GoldenItem[] | undefined;

    constructor(label: string, imageMaster: string, imageFailure: string, imageIsolated: string, imageMasked: string, width: number, height: number) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.imageMaster = imageMaster;
        this.imageFailure = imageFailure;
        this.imageIsolated = imageIsolated;
        this.imageMasked = imageMasked;
        this.width = width;
        this.height = height;
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }


}
