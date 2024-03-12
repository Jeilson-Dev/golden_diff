// panel.webview.html = `<!DOCTYPE html>
//             <html lang="en">
//             <head>
//             <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <style>
//                 --penn-red: #960200ff;
//                 --yellow-green: #8fc31dff;
//                 --ebony: #515a47ff;
//                 --light-blue: #93b7beff;
//                 --columbia-blue: #bfd1e5ff;

//                 .fallure-button{
//                   background: #8fc31dff;
//                 }
//                 .fallure-button:hover{
//                   background: #960200ff;
//                 }

//                 .failure{
//                   background: #960200;
//                 }
                
//                 .center{
//                   display: block;
//                   margin-left: auto;
//                   margin-right: auto;
//                 }
                
//                 /* tabView style */
//                     .tab {
//                         overflow: hidden;
//                         background-color: #f1f1f1;
//                     }

//                     /* tab style */
//                     .tab button {
//                         background-color: inherit;
//                         float: left;
//                         border: none;
//                         outline: none;
//                         cursor: pointer;
//                         padding: 14px 16px;
//                         transition: 0.3s;
//                     }

//                     /* tab selected background */
//                     .tab button.active {
//                         background-color: #ccc;
//                     }

//                     /* tab content style */
//                     .tabContent {
//                         display: none;
//                         padding: 6px 12px;
//                         border: 1px solid #ccc;
//                         border-top: none;
//                     }

//                     section div:first-child {
//                         width: ${item.width}px;
//                         height: ${item.height}px;
//                         background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMaster!))}');
//                         background-repeat: no-repeat;
//                         background-size: ${item.width}px ${item.height}px ;
//                         position: relative;
//                     }
            
//                     section div:last-child {
//                         border-right: solid;
//                         border-color: crimson;
//                         border-width: 1px;
//                         width: ${item.width}px;
//                         height: ${item.height}px;
//                         margin-top: -${item.height}px;
//                         margin-left: 0px;
//                         background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageFailure!))}');
//                         background-repeat: no-repeat;
//                         background-size: ${item.width}px ${item.height}px;
//                         position: relative;
//                     }
        
//                     .slider-width100 {
//                         width: ${item.width}px;
//                     }

//                     @media screen and (-webkit-min-device-pixel-ratio:0) {
//                         input[type='range'] {
//                           overflow: hidden;
//                           width: ${item.width}px;
//                           -webkit-appearance: none;
//                           background-color: #51e312;
//                         }
                        
//                         input[type='range']::-webkit-slider-runnable-track {
//                           height: 10px;
//                           -webkit-appearance: none;
//                           color: #cc0000;
//                           margin-top: -1px;
//                         }
                        
//                         input[type='range']::-webkit-slider-thumb {
//                           width: 10px;
//                           -webkit-appearance: none;
//                           height: 10px;
//                           cursor: ew-resize;
//                           background: #434343;
//                           box-shadow: -${item.width}px 0 0 ${item.width}px #cc0000;
//                         }
                    
//                     }
//                 </style>
               
//             </head>

//             <body>
//             <h3>${item.label} </h3>
            
//                 <div class="tab">
//                     <button class="tabinks failure-button"  id="firstTab" onclick="openTab(event, 'Tab1')">Diff [Test < > Master]<br>Hover To Compare</button>
//                     <button class="tabinks" onclick="openTab(event, 'Tab2')">Test Image<br>[Failure]</button>
//                     <button class="tabinks" onclick="openTab(event, 'Tab3')">Master Image<br>[Expect]</button>
//                     <button class="tabinks" onclick="openTab(event, 'Tab4')">Isolated Image<br>&nbsp</button>
//                     <button class="tabinks" onclick="openTab(event, 'Tab5')">Masked Image<br>&nbsp</button>
                   

                    
//                 </div>

//                 <div id="Tab1" class="tabContent">
//                     <section>
//                         <div></div>
//                         <div id="last" style="${item.width}px; class="center"></div>
//                     </section>
//                     <br>
//                     <input id="slider" class="slider-width100" type="range" oninput="changeWidth(this.value)" min="0" max="100" value="100">
//                 </div>

//                 <div id="Tab2" class="tabContent">
//                     <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageFailure!))}');  
//                         width: ${item.width}px;
//                         height: ${item.height}px;
//                         background-repeat: no-repeat;
//                         background-size:  ${item.width}px ${item.height}px;" >
//                     </div>
//                     <div style="height: 37px;"></div>
//                 </div>

//                 <div id="Tab3" class="tabContent">
//                 <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMaster!))}');  
//                 width: ${item.width}px;
//                     height: ${item.height}px;
//                     background-repeat: no-repeat;
//                     background-size:  ${item.width}px ${item.height}px;" >
//                 </div>
//                 <div style="height: 37px;"></div>
//                 </div>
               
//                 <div id="Tab4" class="tabContent">
//                 <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageIsolated!))}');  
//                 width: ${item.width}px;
//                 height: ${item.height}px;
//                 background-repeat: no-repeat;
//                 background-size:  ${item.width}px ${item.height}px;" >
//                 </div>
//                 <div style="height: 37px;"></div>
//                 </div>
               
//                 <div id="Tab5" class="tabContent">
//                 <div style="background: url('${panel.webview.asWebviewUri(vscode.Uri.file(item.imageMasked!))}');  
//                 width: ${item.width}px;
//                 height: ${item.height}px;
//                 background-repeat: no-repeat;
//                 background-size:  ${item.width}px ${item.height}px;" >
//                 </div>
//                 <div style="height: 37px;"></div>
//                 </div>

//                 <script>
//                     function openTab(evt, tabName) {
//                         var i, tabContent, tabinks;
//                         tabContent = document.getElementsByClassName("tabContent");
//                         for (i = 0; i < tabContent.length; i++) {
//                             tabContent[i].style.display = "none";
//                         }
//                         tabinks = document.getElementsByClassName("tabinks");
//                         for (i = 0; i < tabinks.length; i++) {
//                             tabinks[i].className = tabinks[i].className.replace(" active", "");
//                         }
//                         document.getElementById(tabName).style.display = "block";
//                         evt.currentTarget.className += " active";
//                     }

//                     document.getElementsByClassName("tabinks")[0].click();

//                     const input = document.querySelector("#slider")
//                     input.addEventListener("input", (event) => document.querySelector("#last").style.width = ${item.width}/100 * event.target.value  + 'px');
                    
//                     const firstTab = document.querySelector("#firstTab");

//                     firstTab.addEventListener('mouseenter', () => {
//                         document.querySelector("#last").style.width='0px';
//                         document.querySelector("#slider").value=0;
//                       });
                      
//                       firstTab.addEventListener('mouseleave', () => {
//                         document.querySelector("#last").style.width='${item.width}px';
//                         document.querySelector("#slider").value=100;
//                       });

//                 </script>

//             </body>
    
//             </html>`;