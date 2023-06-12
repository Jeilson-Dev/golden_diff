import * as vscode from 'vscode';
import { GoldenItem } from './golden_item';

export class GoldenProject extends vscode.TreeItem {
    readonly label: string;
    readonly failuresFolder: string;
    item: GoldenProject[];
    children: GoldenItem[];

    constructor(label: string, failuresFolder: string) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.label = label;
        this.failuresFolder = failuresFolder;
        this.item = [];
        this.children = [];
    }
    public add_child(child: GoldenItem) {
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.children.push(child);
    }
}