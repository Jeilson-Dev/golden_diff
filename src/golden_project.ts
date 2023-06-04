import * as vscode from 'vscode';
import { GoldenItem } from './golden_item';

export class GoldenProject extends vscode.TreeItem {
    readonly label: string;
    children: GoldenItem[];

    constructor(label: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.children = [];
    }
    public add_child(child: GoldenItem) {
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        this.children.push(child);
    }
}