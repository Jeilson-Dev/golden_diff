import * as vscode from 'vscode';
import { GoldenFailureItem } from '../golden_failure_item';

export class FailureCSS {
    static css(panel: vscode.WebviewPanel, item: GoldenFailureItem) {
        return `
            .diff-inspector {
                height: 100%;
                
            }
            
            .legend-container {
                padding-top: 20px;
                display: flex;
                width: 100%;
                align-items: center;
                justify-content: center;
                margin-left: auto;
                margin-right: auto;
            
            }
            
            .legend {
                cursor: default;
                padding-left: 14px;
                padding-right: 14px;
                padding-top: 8px;
                padding-bottom: 8px;
                height: 36;
                width: fit-content;
                margin: 4px;
                color: white;
                font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
                font-size: 14px;
                border-radius: 14px;
                box-shadow: 5px 4px 15px #727272;
            }
            .browser-frame {
                margin-top: 30px;
                width: ${item.width}px;
                display: block;
                margin-left: auto;
                margin-right: auto;
                border-radius: 8px 8px 4px 4px;
                box-shadow: 5px 4px 15px #727272;
            }
            
            .browser-frame-header {
                display: flex;
                height: 40px;
                width:${item.width}px;
                padding: 1px;
                align-items: center;
                background-color: #1E1E1E;
                border-radius: 8px 8px 0px 0px;
            }
            
            .browser-frame-content {
                display: flex;
                justify-content: center;
                height: ${item.height}px;
                width: ${item.width}px;
                background-repeat: no-repeat;
                background-size: ${item.width}px ${item.height}px;
                background-image:url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageFailure!))}');
                margin-left: auto;
                margin-right: auto;
                display: flex;
                border-top: transparent;
                border: 1px solid #D1D1D1;
                border-radius: 0px 0px 4px 4px;
            }
            
            .content-flex {
                display: flex;
                justify-content: start;
            }
            
            .browser-frame-header-action-buttons {
                height: 14px;
                width: 14px;
                margin-left: 8px;
                border-radius: 50%;
            }
            
            .minimise-button {
                background-color: #FEBB2E;
            }
            
            .minimise-button:hover {
                background-color: #ffcc5f;
            }
            
            .maximise-button {
                background-color: #29C840;
            }
            
            .maximise-button:hover {
                background-color: #33d44c;
            }
            .close-button {
                background-color: #FE5F57;
            }
            .close-button:hover {
                background-color: #ff766f;
            }
            .window-title {
                cursor: default;
                font-size: 16px;
                margin-left: auto;
                margin-right: auto;
                color: white;
                font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
            }
            .golden-image-title {
                cursor: default;
                margin-left: auto;
                margin-right: auto;
                width: 100%;
                text-align: center;
                border: none;
                padding-left: 20px;
                background-color: #1E1E1E;
                font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
            }
            .golden-image-title-icon {
                font-size: 14px;
                color: #a0a0a0;
                transition: 0.4s ease-in-out;
                background-position: 0px 2px;
                background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYuNDE0MzEgOC45NDQ0Mkw3LjY2NTc1IDEwLjExMTFMMTAuMzA3OSA2LjYxMTA4IiBzdHJva2U9IiM5NDk0OTQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTExLjA4MzQgNC4wODMzN0g1LjYzODkzQzQuNzc5ODIgNC4wODMzNyA0LjA4MzM3IDQuNzc5ODIgNC4wODMzNyA1LjYzODkzVjExLjA4MzRDNC4wODMzNyAxMS45NDI1IDQuNzc5ODIgMTIuNjM4OSA1LjYzODkzIDEyLjYzODlIMTEuMDgzNEMxMS45NDI1IDEyLjYzODkgMTIuNjM4OSAxMS45NDI1IDEyLjYzODkgMTEuMDgzNFY1LjYzODkzQzEyLjYzODkgNC43Nzk4MiAxMS45NDI1IDQuMDgzMzcgMTEuMDgzNCA0LjA4MzM3WiIgc3Ryb2tlPSIjOTQ5NDk0IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yLjE3ODU4IDkuMzMxNzlMMS4zNzgyNCAzLjk0NjQ2QzEuMjUyMjQgMy4wOTYzNSAxLjgzODY5IDIuMzA1MzUgMi42ODgwMiAyLjE3OTM1TDguMDczMzYgMS4zNzkwMkM4Ljc5OTAyIDEuMjcwOTEgOS40ODExMyAxLjY4MjM1IDkuNzQ0MDIgMi4zMzQxMyIgc3Ryb2tlPSIjOTQ5NDk0IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=");
                background-repeat: no-repeat;
            }
            .golden-image-title-icon:hover {
                font-size: 14px;
                color: white;
                background-position: 0px 2px;
                background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgICA8cGF0aCBkPSJNNi40MTQzMSA4Ljk0NDQyTDcuNjY1NzUgMTAuMTExMUwxMC4zMDc5IDYuNjExMDgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogICAgICAgIDxwYXRoIGQ9Ik0xMS4wODM0IDQuMDgzMzdINS42Mzg5M0M0Ljc3OTgyIDQuMDgzMzcgNC4wODMzNyA0Ljc3OTgyIDQuMDgzMzcgNS42Mzg5M1YxMS4wODM0QzQuMDgzMzcgMTEuOTQyNSA0Ljc3OTgyIDEyLjYzODkgNS42Mzg5MyAxMi42Mzg5SDExLjA4MzRDMTEuOTQyNSAxMi42Mzg5IDEyLjYzODkgMTEuOTQyNSAxMi42Mzg5IDExLjA4MzRWNS42Mzg5M0MxMi42Mzg5IDQuNzc5ODIgMTEuOTQyNSA0LjA4MzM3IDExLjA4MzQgNC4wODMzN1oiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogICAgICAgIDxwYXRoIGQ9Ik0yLjE3ODU4IDkuMzMxNzlMMS4zNzgyNCAzLjk0NjQ2QzEuMjUyMjQgMy4wOTYzNSAxLjgzODY5IDIuMzA1MzUgMi42ODgwMiAyLjE3OTM1TDguMDczMzYgMS4zNzkwMkM4Ljc5OTAyIDEuMjcwOTEgOS40ODExMyAxLjY4MjM1IDkuNzQ0MDIgMi4zMzQxMyIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgICAgICAgPC9zdmc+");
                background-repeat: no-repeat;
            }
            .copy-button-icon {
                height: auto;
                margin-left: 14px;
            }
            .status-image-name-copied {
                visibility: hidden;
                transition: 0.4s ease-in-out;
                font-size: 14px;
                margin-left: 10px;
                color: white;
                font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
            
            }
            .golden-failure {
                height: 100%;
                width: 100%;
                margin: auto;
            }
            
            .hidden {
                visibility: hidden;
            }`;


    }
}
