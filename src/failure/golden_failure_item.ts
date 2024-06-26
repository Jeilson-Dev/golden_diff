import * as vscode from 'vscode';

export class GoldenFailureItem extends vscode.TreeItem {
    readonly label: string;
    readonly failureFolder: string;
    readonly imageMaster: string;
    readonly imageFailure: string;
    readonly imageIsolated: string;
    readonly imageMasked: string;
    readonly width: number;
    readonly height: number;
    public collapsibleState: vscode.TreeItemCollapsibleState;

    public children: GoldenFailureItem[];

    constructor(label: string, failureFolder: string, imageMaster: string, imageFailure: string, imageIsolated: string, imageMasked: string, width: number, height: number, collapsibleState: vscode.TreeItemCollapsibleState) {
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
        this.collapsibleState = collapsibleState;
    }

public contains(projects:GoldenFailureItem[]) :boolean{
    let contains = false;
    projects.map(project=> {
        if(this.failureFolder == project.failureFolder){
            contains = true;
        }
        });
        
        return contains;
}
}
