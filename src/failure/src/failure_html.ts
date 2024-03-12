import { GoldenFailureItem } from "../golden_failure_item";
import { FailureCSS } from "./failure_css";

import * as vscode from 'vscode';
export class FailureHtml {
    static html(item: GoldenFailureItem, panel: vscode.WebviewPanel) {
        return `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                        ${FailureCSS.css(panel, item)}
                        </style>
                        <script>
                        function onCopyTextToClipboard() {
                            let textEditor = document.createElement("input");
                            textEditor.value = '${item.label}';
                            navigator.clipboard.writeText(textEditor.value);
                            document.getElementById("copy_status").style.visibility = 'visible';
                        }
                        function onMouseLeave() {
                            let goldenFailure = document.getElementById('golden_failure');
                            goldenFailure.style.backgroundColor = 'black';
                            goldenFailure.style.backgroundImage="url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageFailure!))}')";
                            goldenFailure.style.backgroundSize = '${item.width}px ${item.height}px';
                        }
                        function onHoverMaster() {
                            let goldenFailure = document.getElementById('golden_failure');
                            goldenFailure.style.backgroundColor = 'black';
                            goldenFailure.style.backgroundImage="url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMaster!))}')";
                            goldenFailure.style.backgroundSize = '${item.width}px ${item.height}px';
                        }
                        function onHoverIsolated() {
                            let goldenFailure = document.getElementById('golden_failure');
                            goldenFailure.style.backgroundColor = 'black';
                            goldenFailure.style.backgroundImage="url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageIsolated!))}')";
                            goldenFailure.style.backgroundSize = '${item.width}px ${item.height}px';
                        }
                        function onHoverMasked() {
                            let goldenFailure = document.getElementById('golden_failure');
                            goldenFailure.style.backgroundColor = 'black';
                            goldenFailure.style.backgroundImage="url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMasked!))}')";
                            goldenFailure.style.backgroundSize = '${item.width}px ${item.height}px';
                        }
                        </script>
                    </head>
                    <body>
                    <div class="browser-frame">
                    <div class="browser-frame-header ">
                        <div class="content-flex">
                            <div onmouseleave="onMouseLeave()" onmouseenter="onHoverMaster()" class="browser-frame-header-action-buttons close-button" > </div>
                            <div onmouseleave="onMouseLeave()" onmouseenter="onHoverIsolated()" class="browser-frame-header-action-buttons minimise-button" > </div>
                            <div onmouseleave="onMouseLeave()" onmouseenter="onHoverMasked()" class="browser-frame-header-action-buttons maximise-button" > </div>
                        </div>
                        <div class="window-title content-flex" onclick="onCopyTextToClipboard()">
                            <div class="golden-image-title golden-image-title-text golden-image-title-icon">${item.label}</div>
                            <div id="copy_status" class="status-image-name-copied">Copied!</div>
                        </div>
                    </div>
                    <div class="browser-frame-content">
                        <img  class="golden-failure" id="golden_failure" alt="">
                    </div>
            
                </div>
                <div class="legend-container">
                    <div class="close-button legend" onmouseleave="onMouseLeave()" onmouseenter="onHoverMaster()">Master</div>
                    <div class="minimise-button legend" onmouseleave="onMouseLeave()" onmouseenter="onHoverIsolated()">Isolated</div>
                    <div class="maximise-button legend" onmouseleave="onMouseLeave()" onmouseenter="onHoverMasked()">Masked</div>
                </div>
            </body>
                    </html>`;


    }

}