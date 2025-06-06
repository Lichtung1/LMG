let siteContent = {}; // Global variable to store fetched JSON data

// Function to fetch content from JSON file
async function fetchContent() {
    try {
        const response = await fetch('content.json'); // Assumes content.json is in the same folder
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        siteContent = await response.json();
        console.log("Site content loaded successfully.");
    } catch (error) {
        console.error("Could not load site content:", error);
        // Setup fallback content if JSON loading fails
        siteContent.operatorLog = { 
            title: "Error Reading Profile", 
            text: "Operator Log content could not be loaded.\nPlease check content.json." 
        };
        siteContent.moyamoyaLauncher = { 
            title: "Error Loading Launcher", 
            text: "Moyamoya OS Launcher content could not be loaded.\nPlease check content.json." 
        };
         siteContent.lichtungExplainer = { 
            title: "Error Loading Notes", 
            text: "Lichtung notes could not be loaded.\nPlease check content.json." 
        };
    }
}

// Function to initialize all desktop functionality after content is loaded
function initializeDesktop() {
    const desktop = document.getElementById('desktop');
    const windowTemplate = document.getElementById('window-template');
    const taskbarClock = document.getElementById('taskbar-clock');
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const taskbarButtonsContainer = document.getElementById('taskbar-buttons-container');

    let highestZIndex = 20;
    let openWindowCount = 0;
    const openWindows = {}; 

    // Data array for your art files
    const myArtFiles = [
        { id: "art-publicdomain", name: "PublicDomain.mp4", date: "2025-06-02 10:50 AM", type: "MP4 Video File", size: "56,035 KB", path: " art/PublicDomain.mp4", fileType: "video", aspectRatio: "square" },
        { id: "art-skullsmash", name: "Skullsmash.mp4", date: "2025-04-15 10:39 AM", type: "MP4 Video File", size: "47,996 KB", path: " art/Skullsmash.mp4", fileType: "video", aspectRatio: "square" },
        { id: "art-autoamputation", name: "autoamputation.mp4", date: "2025-04-09 6:00 PM", type: "MP4 Video File", size: "40,072 KB", path: " art/autoamputation.mp4", fileType: "video", aspectRatio: "square" },
        { id: "art-computerchip", name: "ComputerChip.mp4", date: "2025-04-01 1:01 PM", type: "MP4 Video File", size: "96,885 KB", path: " art/ComputerChip.mp4", fileType: "video", aspectRatio: "square" },
        { id: "art-moyalongsleeve", name: "MOYALONGSLEEVE.png", date: "2025-03-25 4:48 PM", type: "PNG File", size: "1,703 KB", path: " art/MOYALONGSLEEVE.png", fileType: "image", aspectRatio: "square" },
        
        // **** EXISTING FILES (now without the square property, so they'll open with responsive aspect ratio) ****
        { id: "art-nosnowlgia", name: "nosnowlgia.png", date: "2025-03-02 11:38 AM", type: "PNG File", size: "2,152 KB", path: "art/nosnowlgia.png", fileType: "image" , aspectRatio: "square" },
        { id: "art-extraanimation", name: "extraanimation.mp4", date: "2025-02-11 9:51 AM", type: "MP4 Video File", size: "11,671 KB", path: "art/extraaninimation.mp4", fileType: "video" , aspectRatio: "square" },
        { id: "art-try2", name: "try2.mp4", date: "2025-01-26 8:36 PM", type: "MP4 Video File", size: "45,271 KB", path: "art/try2.mp4", fileType: "video" },
        { id: "art-skullvid", name: "SKULLVID_processed_blownout.mp4", date: "2025-01-18 11:06 PM", type: "MP4 Video File", size: "41,022 KB", path: "art/SKULLVID_processed_blownout.mp4", fileType: "video", aspectRatio: "square"  },
        { id: "art-hubrender", name: "hubrender_v3_3.png", date: "2025-01-16 9:34 AM", type: "PNG File", size: "3,073 KB", path: "art/hubrender_v3_3.png", fileType: "image", aspectRatio: "square"  },
        { id: "art-shirtdone", name: "ShirtDone_v2.png", date: "2024-12-31 11:34 AM", type: "PNG File", size: "2,524 KB", path: "art/ShirtDone_v2.png", fileType: "image" , aspectRatio: "square" },
        { id: "art-skullposter", name: "skullposterV4.jpg", date: "2024-12-08 10:20 PM", type: "JPG File", size: "685 KB", path: "art/skullposterV4.jpg", fileType: "image" , aspectRatio: "square" },
        { id: "art-textposter", name: "TextPoster_v7.png", date: "2024-11-29 12:56 PM", type: "PNG File", size: "2,644 KB", path: "art/TextPoster_v7.png", fileType: "image" , aspectRatio: "square" },
        { id: "art-cassette", name: "Cassette_V3.jpg", date: "2024-10-20 10:43 PM", type: "JPG File", size: "553 KB", path: "art/Cassette_V3.jpg", fileType: "image" , aspectRatio: "square" },
        { id: "art-fakead", name: "fakeadvertisment2.png", date: "2024-09-30 5:01 PM", type: "PNG File", size: "2,489 KB", path: "art/fakeadvertisment2.png", fileType: "image" , aspectRatio: "square" }
    ];

    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        taskbarClock.textContent = `${hours}:${minutes} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    startButton.addEventListener('click', (event) => {
        event.stopPropagation();
        startMenu.style.display = startMenu.style.display === 'none' || startMenu.style.display === '' ? 'block' : 'none';
    });

    document.addEventListener('click', (event) => {
        if (desktop && !startMenu.contains(event.target) && event.target !== startButton) {
            startMenu.style.display = 'none';
        }
    });

    function updateTaskbarButtonStates(activeWindowId) {
        document.querySelectorAll('.taskbar-button').forEach(btn => {
            const windowData = openWindows[btn.dataset.windowId];
            const windowExistsAndVisible = windowData && windowData.element && !windowData.element.classList.contains('minimized');
            if (btn.dataset.windowId === activeWindowId && windowExistsAndVisible) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function makeWindowActive(windowElement) {
        if (!windowElement || windowElement.classList.contains('minimized')) return;
        document.querySelectorAll('.window.active').forEach(activeWin => {
            activeWin.classList.remove('active');
            const taskbarBtn = openWindows[activeWin.id]?.taskbarButton;
            if (taskbarBtn) taskbarBtn.classList.remove('active');
        });
        windowElement.classList.add('active');
        highestZIndex++;
        windowElement.style.zIndex = highestZIndex;
        updateTaskbarButtonStates(windowElement.id);
        const focusable = windowElement.querySelector('iframe, textarea');
        if (focusable) {
            focusable.focus();
        }
    }

    function makeDraggable(windowElement) {
        const titleBar = windowElement.querySelector('.title-bar');
        if (!titleBar) return;
        let isDragging = false, offsetX, offsetY;
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            offsetX = e.clientX - windowElement.offsetLeft;
            offsetY = e.clientY - windowElement.offsetTop;
            titleBar.style.cursor = 'grabbing';
            windowElement.style.transition = 'none';
            makeWindowActive(windowElement);
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let newX = e.clientX - offsetX, newY = e.clientY - offsetY;
            const desktopRect = desktop.getBoundingClientRect();
            newX = Math.max(0, Math.min(newX, desktopRect.width - windowElement.offsetWidth));
            newY = Math.max(0, Math.min(newY, desktopRect.height - windowElement.offsetHeight));
            windowElement.style.left = newX + 'px';
            windowElement.style.top = newY + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                titleBar.style.cursor = 'grab';
                windowElement.style.transition = '';
            }
        });
    }
    
    function minimizeWindow(windowElement) {
        if (!windowElement) return;
        windowElement.classList.add('minimized'); 
        windowElement.classList.remove('active'); 
        const taskbarButton = openWindows[windowElement.id]?.taskbarButton;
        if (taskbarButton) taskbarButton.classList.remove('active');
        const nextWindow = Array.from(desktop.querySelectorAll('.window:not(.minimized)'))
                              .sort((a,b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0))[0];
        if(nextWindow) makeWindowActive(nextWindow);
        else updateTaskbarButtonStates(null); 
    }

    function restoreWindow(windowElement) {
        if (!windowElement) return;
        windowElement.classList.remove('minimized'); 
        makeWindowActive(windowElement);
    }

    function makeResizable(windowElement) {
        const resizeHandle = windowElement.querySelector('.resize-handle');
        if (!resizeHandle) return;
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        const computedStyle = getComputedStyle(windowElement);
        const minWidth = parseInt(computedStyle.minWidth, 10) || 150;
        const minHeight = parseInt(computedStyle.minHeight, 10) || 100;
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault(); e.stopPropagation(); 
            isResizing = true;
            startX = e.clientX; startY = e.clientY;
            startWidth = windowElement.offsetWidth; startHeight = windowElement.offsetHeight;
            windowElement.style.transition = 'none'; 
            document.body.style.cursor = 'se-resize'; 
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        function onMouseMove(e) {
            if (!isResizing) return;
            const dx = e.clientX - startX; const dy = e.clientY - startY;
            let newWidth = startWidth + dx; let newHeight = startHeight + dy;
            newWidth = Math.max(newWidth, minWidth); newHeight = Math.max(newHeight, minHeight);
            windowElement.style.width = newWidth + 'px';
            windowElement.style.height = newHeight + 'px';
        }
        function onMouseUp() {
            if (isResizing) {
                isResizing = false;
                windowElement.style.transition = ''; 
                document.body.style.cursor = 'default'; 
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        }
    }

    function manageTaskbarButton(windowElement, title) {
        const windowId = windowElement.id;
        let taskbarButton = openWindows[windowId]?.taskbarButton;
        if (!taskbarButton) {
            taskbarButton = document.createElement('button');
            taskbarButton.className = 'taskbar-button';
            taskbarButton.textContent = title;
            taskbarButton.dataset.windowId = windowId;
            taskbarButton.addEventListener('click', () => {
                const targetWindow = openWindows[windowId]?.element;
                if (targetWindow) {
                    if (targetWindow.classList.contains('minimized')) restoreWindow(targetWindow);
                    else if (targetWindow.classList.contains('active')) minimizeWindow(targetWindow); 
                    else makeWindowActive(targetWindow);
                }
            });
            taskbarButtonsContainer.appendChild(taskbarButton);
            if (openWindows[windowId]) {
                openWindows[windowId].taskbarButton = taskbarButton;
            } else { 
                openWindows[windowId] = { element: windowElement, minimized: false, taskbarButton: taskbarButton };
            }
        }
        updateTaskbarButtonStates(windowId); 
    }

    function openWindow(id, htmlTitleFallback, contentType, directContent, contentUrl, contentKey, windowTitleKey) {
        let windowElement = document.getElementById(id);
        if (windowElement) { 
            if (windowElement.classList.contains('minimized')) restoreWindow(windowElement);
            else makeWindowActive(windowElement);
            return windowElement;
        }
        
        windowElement = windowTemplate.cloneNode(true);
        if (!windowElement) { console.error("Failed to clone window template!"); return null; }
        windowElement.id = id;
        windowElement.style.display = 'none'; 
        
        let finalTitle = htmlTitleFallback || 'Window';
        if (windowTitleKey && siteContent[windowTitleKey] && siteContent[windowTitleKey].title) {
            finalTitle = siteContent[windowTitleKey].title;
        }
        const titleSpan = windowElement.querySelector('.title');
        if (titleSpan) titleSpan.textContent = finalTitle;
        
        const windowBody = windowElement.querySelector('.window-body');
        if (!windowBody) { console.error("Window body not found for", id); desktop.appendChild(windowElement); return windowElement; }
        windowBody.innerHTML = ''; 

        if (contentKey && siteContent[contentKey] && typeof siteContent[contentKey].text === 'string') {
            const preformattedText = document.createElement('pre');
            preformattedText.textContent = siteContent[contentKey].text.trim();
            preformattedText.style.cssText = `font-family: "Courier New", monospace; font-size: 12px; line-height: 1.4; white-space: pre-wrap; margin: 0; padding: 5px; word-break: break-word;`;
            windowBody.style.padding = '2px'; 
            windowBody.appendChild(preformattedText);
            windowElement.style.width = '550px'; 
            windowElement.style.height = 'auto'; 
            windowElement.style.minHeight = '300px'; 
            windowElement.style.maxHeight = 'calc(100vh - 100px)';
        } else if (contentType === 'textarea') {
            const textarea = document.createElement('textarea');
            textarea.value = directContent || 'Type here...';
            windowBody.appendChild(textarea);
        } else if (contentType === 'iframe') {
            const iframe = document.createElement('iframe');
            iframe.src = contentUrl || 'about:blank';
            windowBody.classList.add('iframe-container'); 
            windowBody.appendChild(iframe);
            windowElement.style.width = '640px'; 
            windowElement.style.height = '480px';
        } else if (contentType === 'custom-art-list') {
            const container = document.createElement('div');
            container.className = 'file-list-container';
            const table = document.createElement('table');
            table.className = 'file-list-table';
            table.innerHTML = `<thead><tr><th>Name</th><th>Date Modified</th><th>Type</th><th>Size</th></tr></thead>`;
            const tbody = document.createElement('tbody');
            myArtFiles.forEach(file => {
                const row = document.createElement('tr');
                const iconPath = file.fileType === 'video' ? 'images/video_icon.png' : 'images/image_icon.png';
                row.innerHTML = `<td><div class="file-name-cell"><img src="${iconPath}" alt="file icon" class="file-icon"> ${file.name}</div></td><td>${file.date}</td><td>${file.type}</td><td class="size-cell">${file.size}</td>`;
                
                row.addEventListener('dblclick', () => {
                    const viewerId = `viewer-${file.id}`;
                    const viewerTitle = file.name;
                    const viewerPath = file.path;

                    // Check for the new aspectRatio property
                    if (file.aspectRatio === 'square') {
                        // Logic for square windows
                        const shorterDimension = Math.min(desktop.offsetWidth, desktop.offsetHeight);
                        const size = shorterDimension * 0.75; // Make it 75% of the shortest screen side
                        
                        let viewerWindow;
                        if (file.fileType === 'video') {
                            viewerWindow = openWindow(viewerId, viewerTitle, 'video-player', '', viewerPath, null, null);
                        } else { // image
                            viewerWindow = openWindow(viewerId, viewerTitle, 'image-viewer', '', viewerPath, null, null);
                        }

                        if (viewerWindow) {
                            viewerWindow.style.width = size + 'px';
                            viewerWindow.style.height = (size + 30) + 'px'; // Add 30px for title bar
                            // Center the square window
                            viewerWindow.style.left = Math.max(0, (desktop.offsetWidth - size) / 2) + 'px';
                            viewerWindow.style.top = Math.max(0, (desktop.offsetHeight - (size + 30)) / 2) + 'px';
                        }
                    } else {
                        // Fallback to the original responsive logic for non-square files
                        if (file.fileType === 'video') {
                            const maxWidth = desktop.offsetWidth * 0.8;
                            const videoWidth = Math.min(854, maxWidth); 
                            const videoHeight = videoWidth * (9 / 16);
                            const videoWindow = openWindow(viewerId, viewerTitle, 'video-player', '', viewerPath, null, null);
                            if (videoWindow) {
                                videoWindow.style.width = videoWidth + 'px';
                                videoWindow.style.height = (videoHeight + 30) + 'px';
                                videoWindow.style.left = Math.max(0, (desktop.offsetWidth - videoWidth) / 2) + 'px';
                                videoWindow.style.top = Math.max(0, (desktop.offsetHeight - videoHeight) / 2) + 'px';
                            }
                        } else if (file.fileType === 'image') {
                            const img = new Image();
                            img.src = viewerPath;
                            img.onload = () => {
                                const padding = 60;
                                const maxW = desktop.offsetWidth - padding;
                                const maxH = desktop.offsetHeight - padding;
                                const imgW = img.naturalWidth;
                                const imgH = img.naturalHeight;
                                const ratio = Math.min(maxW / imgW, maxH / imgH, 1);
                                const winW = Math.round(imgW * ratio);
                                const winH = Math.round(imgH * ratio);
                                const imageWindow = openWindow(viewerId, viewerTitle, 'image-viewer', '', viewerPath, null, null);
                                if (imageWindow) {
                                    imageWindow.style.width = (winW + 10) + 'px';
                                    imageWindow.style.height = (winH + 40) + 'px';
                                    imageWindow.style.left = Math.max(0, (desktop.offsetWidth - (winW + 10)) / 2) + 'px';
                                    imageWindow.style.top = Math.max(0, (desktop.offsetHeight - (winH + 40)) / 2) + 'px';
                                }
                            };
                            img.onerror = () => { alert("Could not load image: " + viewerPath); };
                        }
                    }
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            container.appendChild(table);
            windowBody.style.padding = '0'; 
            windowBody.appendChild(container);
            windowElement.style.width = '650px';
            windowElement.style.height = '400px';
        } else if (contentType === 'image-viewer') {
            const img = document.createElement('img');
            img.src = contentUrl;
            img.alt = finalTitle;
            windowBody.classList.add('image-viewer-container');
            windowBody.appendChild(img);
        } else if (contentType === 'video-player') {
            const videoPlayerContainer = document.createElement('div');
            videoPlayerContainer.style.cssText = 'width:100%; height:100%; background:black; display:flex; align-items:center; justify-content:center;';
            const videoElement = document.createElement('video');
            videoElement.src = contentUrl;
            videoElement.controls = true;     // Keep controls so user can unmute/pause
            videoElement.autoplay = true;     // **** ADDED: Tell the video to play automatically ****
            videoElement.muted = false;        // **** ADDED: Mute it to allow autoplay ****
            videoElement.loop = true;         // **** ADDED: Make it loop (great for animations) ****
            videoElement.style.cssText = 'max-width:100%; max-height:100%;';
            videoPlayerContainer.appendChild(videoElement);
            windowBody.appendChild(videoPlayerContainer);
        }else if (contentType === 'custom' && directContent instanceof Node) {
            windowBody.appendChild(directContent);
        } else if (directContent) { 
            const p = document.createElement('p');
            p.textContent = directContent;
            windowBody.appendChild(p);
        } else { 
             const p = document.createElement('p');
             p.textContent = 'Content not specified or type unknown.';
             windowBody.appendChild(p);
        }

        const initialX = 50 + (openWindowCount % 10) * 20;
        const initialY = 50 + (openWindowCount % 10) * 20;
        windowElement.style.left = initialX + 'px';
        windowElement.style.top = initialY + 'px';
        
        desktop.appendChild(windowElement);
        openWindows[id] = { element: windowElement, minimized: false, taskbarButton: null };
        makeDraggable(windowElement); 
        makeResizable(windowElement); 
        openWindowCount++;

        const closeButton = windowElement.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const windowData = openWindows[id]; 
                if (windowData?.element?.parentNode) windowData.element.remove(); 
                if (windowData?.taskbarButton?.parentNode) windowData.taskbarButton.remove(); 
                delete openWindows[id]; 
                const nextTopWindow = Array.from(desktop.querySelectorAll('.window:not(.minimized)'))
                                        .sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0))[0];
                if (nextTopWindow) makeWindowActive(nextTopWindow);
                else updateTaskbarButtonStates(null); 
            });
        }

        const minimizeButton = windowElement.querySelector('.minimize-button');
        if (minimizeButton) {
            minimizeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                minimizeWindow(openWindows[id]?.element); 
            });
        }
        
        windowElement.addEventListener('mousedown', () => makeWindowActive(openWindows[id]?.element), true);
        
        windowElement.style.display = 'flex';
        manageTaskbarButton(windowElement, finalTitle); 
        makeWindowActive(windowElement); 
        return windowElement;
    }

     // --- ICON EVENT LISTENERS ---

    // Generic listener for all icons that DON'T have special behaviors
    document.querySelectorAll('.desktop-icon:not(#icon-mmos):not(#icon-lichtung):not(#icon-moth)').forEach(icon => {
        icon.addEventListener('dblclick', () => {
            openWindow( 
                icon.dataset.windowId, icon.dataset.windowTitle, icon.dataset.contentType, 
                icon.dataset.content, icon.dataset.contentUrl, icon.dataset.contentKey,  
                icon.dataset.windowTitleKey
            );
        });
        icon.addEventListener('click', (e) => {
            document.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            icon.classList.add('selected');
        });
    });

    // Special listener for the MMOS.exe icon
    const mmosIcon = document.getElementById('icon-mmos');
    if (mmosIcon) {
        mmosIcon.addEventListener('dblclick', () => {
            const argWindow = openWindow('moyamoya-arg-main-window', 'MOYAMOYA OS', 'iframe', '', 'https://moyamoya.ca', null, null);
            if (argWindow) {
                argWindow.style.width = '800px'; argWindow.style.height = '600px';
                argWindow.style.left = Math.max(0, (desktop.offsetWidth - 800) / 2) + 'px';
                argWindow.style.top = Math.max(0, (desktop.offsetHeight - 600) / 2) + 'px';
            }
            const explainerWindow = openWindow('moyamoya-explainer-window', null, null, null, null, 'moyamoyaLauncher', 'moyamoyaLauncher');
            if (explainerWindow && argWindow) {
                explainerWindow.style.width = '450px';
                const leftPos = argWindow.offsetLeft + 40;
                const topPos = argWindow.offsetTop + 40;
                explainerWindow.style.left = leftPos + 'px';
                explainerWindow.style.top = topPos + 'px';
            }
        });
        mmosIcon.addEventListener('click', () => {
            document.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            mmosIcon.classList.add('selected');
        });
    }

    // Special listener for the Lichtung.exe icon
    const lichtungIcon = document.getElementById('icon-lichtung');
    if (lichtungIcon) {
        lichtungIcon.addEventListener('dblclick', () => {
            const artWindow = openWindow('lichtung-art-main-window', 'Where I Cannot Find Him', 'iframe', '', 'https://lichtung1.github.io/Where-I-Cannot-Find-Him-V2/', null, null);
            if (artWindow) {
                artWindow.style.width = '700px'; artWindow.style.height = '500px';
                artWindow.style.left = Math.max(0, (desktop.offsetWidth - 700) / 2) + 'px';
                artWindow.style.top = Math.max(0, (desktop.offsetHeight - 500) / 2) + 'px';
            }
            const explainerWindow = openWindow('lichtung-explainer-window', null, null, null, null, 'lichtungExplainer', 'lichtungExplainer');
            if (explainerWindow && artWindow) {
                explainerWindow.style.width = '350px';
                const leftPos = artWindow.offsetLeft + 40;
                const topPos = artWindow.offsetTop + 40;
                explainerWindow.style.left = leftPos + 'px';
                explainerWindow.style.top = topPos + 'px';
            }
        });
        lichtungIcon.addEventListener('click', () => {
            document.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            lichtungIcon.classList.add('selected');
        });
    }

    // **** NEW: Special listener for the Luana_Moth.exe icon ****
    const mothIcon = document.getElementById('icon-moth'); // Corrected ID
    if (mothIcon) {
        mothIcon.addEventListener('dblclick', () => {
            // This is the logic you wrote, to open the LMG website
            const argWindow = openWindow(
                'lmg-main-window', // A unique ID for this window
                'Luana Moth Generator',        // The window title
                'iframe',                    // The content type
                '',                          // No direct content
                'https://lichtung1.github.io/LMG/', // The URL
                null, null
            );

            // Set a good size for the window
            if (argWindow) {
                argWindow.style.width = '800px'; 
                argWindow.style.height = '600px';
                argWindow.style.left = Math.max(0, (desktop.offsetWidth - 800) / 2) + 'px';
                argWindow.style.top = Math.max(0, (desktop.offsetHeight - 600) / 2) + 'px';
            }

            // If you want an explainer for this one too, you would add a second openWindow call here
            // just like the others, after adding its text to content.json.
            const explainerWindow = openWindow('moth-explainer-window', null, null, null, null, 'mothExplainer', 'mothExplainer');
            if (explainerWindow && artWindow) {
                explainerWindow.style.width = '350px';
                const leftPos = artWindow.offsetLeft + 40;
                const topPos = artWindow.offsetTop + 40;
                explainerWindow.style.left = leftPos + 'px';
                explainerWindow.style.top = topPos + 'px';
            }
        });

        // Add the single-click listener to select it
        mothIcon.addEventListener('click', () => {
            document.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            mothIcon.classList.add('selected');
        });
    }

    if (desktop) { 
        desktop.addEventListener('click', (e) => {
            if (e.target === desktop) {
                document.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
                startMenu.style.display = 'none';
            }
        });
    }

    startMenu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = item.dataset.action;
            startMenu.style.display = 'none'; 
            if (action === 'open-window') {
                openWindow( 
                    item.dataset.windowId, item.dataset.windowTitle, item.dataset.contentType, 
                    item.dataset.content, item.dataset.contentUrl, item.dataset.contentKey, 
                    item.dataset.windowTitleKey
                );
            } else if (action === 'shutdown') {
                const shutdownDialogId = "shutdown-dialog";
                let shutdownDialog = document.getElementById(shutdownDialogId);
                if (!shutdownDialog || !document.body.contains(shutdownDialog)) {
                    const contentElement = document.createElement('div'); 
                    contentElement.style.textAlign = 'center';
                    contentElement.innerHTML = `<p style="margin-top:10px; margin-bottom:15px;">Are you sure you want to shut down?</p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEpSURBVFhH7ZaxCsIwGIb7AÖRSOOkU3KumzQP4DA7uUrwPDiJ3cXHqVAQfyMsmhCSEnGrbk8AHgnBCfq+XVDGh82ZnZ2eHryqKvGzfVNWtqvpVVTcP1nYWvnX5zGqLBI9UFKoqCqCVSkBBBKCEVAEvgTjG0yDEjDxJ802CFRpGNZ0G+iAIgo2yYdF4lY2D/S1gb8nZuiGC3rU9J2ZmkB60dUmrYcFKEM7GgMvV1rLgZunYAuYAXYoYlUQlTsozYHVZ0CVNyrPAnVVoQ9M6q8A1nQZ603Qe6IMhCHzVsAzbLDtsGBXWWDLsOXgGsK0LqN3SNPBYsLxC6qC8wSMXrzYrmiPF4fQTVDLsOXgG6O1QWewu70kKqzUAUgQ8WqgqfGzfVNVtKpNnZ2dnx58uAATuN7d/l0EWAAAAAElFTkSuQmCC" alt="Shutdown icon" style="width:32px; height:32px; margin-bottom:10px;"><br><button class="win95-button" id="shutdown-yes-btn">Yes</button><button class="win95-button" id="shutdown-no-btn">No</button>`;                    
                    shutdownDialog = openWindow(shutdownDialogId, "Shut Down Windows", "custom", contentElement, "", null, null); 
                    if (shutdownDialog) { 
                        const yesBtn = shutdownDialog.querySelector('#shutdown-yes-btn');
                        const noBtn = shutdownDialog.querySelector('#shutdown-no-btn');
                        if (yesBtn) yesBtn.onclick = () => { /* ... shutdown yes logic ... */ };
                        if (noBtn) noBtn.onclick = () => { /* ... shutdown no logic ... */ };
                    }
                } else { makeWindowActive(shutdownDialog); }
            } else if (action === 'help') { alert("Windows Help: Not implemented in this demo."); } 
            else if (action === 'run') {
                const runCommand = prompt("Open:");
                if (runCommand) alert(`Attempting to run: ${runCommand}\n(Functionality not implemented)`);
            }
        });
    });

    function openWelcomeWindows() {
        // Define IDs and content keys for clarity
        const welcomeId = 'welcome-notepad';
        const welcomeContentKey = 'welcomeNote';
        const photoId = 'photo-viewer-window';
        const photoTitle = 'Operator';
        const photoPath = 'images/ME.png'; // Make sure this path is correct

        // 1. Open the Welcome Notepad
        let welcomeWindow = null;
        if (siteContent[welcomeContentKey]) {
            welcomeWindow = openWindow(
                welcomeId,
                siteContent[welcomeContentKey].title,
                'textarea',
                siteContent[welcomeContentKey].text,
                null, null, null
            );
            if (welcomeWindow) {
                const welcomeWidth = 400; // The width we are setting
                welcomeWindow.style.width = welcomeWidth + 'px';
                welcomeWindow.style.height = '250px';

                // **** CHANGED: Logic to center the window horizontally ****
                const welcomeLeft = (desktop.offsetWidth - welcomeWidth) / 2;
                welcomeWindow.style.left = Math.max(10, welcomeLeft) + 'px'; // Center it, but with a minimum 10px margin
                welcomeWindow.style.top = '50px';
            }
        }

        // 2. Open the Image of You, positioned relative to the welcome note
        const img = new Image();
        img.src = photoPath;
        img.onload = () => {
            // Get a fresh reference to the welcome window after it has been placed
            const welcomeWindowEl = document.getElementById(welcomeId);

            // Preload image to get its dimensions for a perfectly sized window
            const padding = 100;
            const maxW = desktop.offsetWidth - padding;
            const maxH = desktop.offsetHeight - padding;
            const imgW = img.naturalWidth;
            const imgH = img.naturalHeight;
            const ratio = Math.min(maxW / imgW, maxH / imgH, 1);
            const winW = Math.round(imgW * ratio);
            const winH = Math.round(imgH * ratio);

            const imageWindow = openWindow(photoId, photoTitle, 'image-viewer', null, photoPath, null, null);
            
            if (imageWindow) {
                const imageWindowWidth = winW + 10;
                imageWindow.style.width = imageWindowWidth + 'px';
                imageWindow.style.height = (winH + 40) + 'px';

                if (welcomeWindowEl) {
                    // **** CHANGED: Logic to center this window horizontally AND place it below ****
                    const imageLeft = (desktop.offsetWidth - imageWindowWidth) / 2;
                    imageWindow.style.left = Math.max(10, imageLeft) + 'px'; // Center it too
                    imageWindow.style.top = (welcomeWindowEl.offsetTop + welcomeWindowEl.offsetHeight + 10) + 'px'; // 10px gap below
                } else {
                    // Fallback positioning if the welcome window failed to open
                    const imageLeft = (desktop.offsetWidth - imageWindowWidth) / 2;
                    imageWindow.style.left = Math.max(10, imageLeft) + 'px';
                    imageWindow.style.top = '60px';
                }
            }
            
            // Finally, ensure the top window (welcome note) has focus by default
            if (welcomeWindowEl) {
                makeWindowActive(welcomeWindowEl);
            }
        };
        img.onerror = () => { console.warn(`Could not load initial photo at: ${photoPath}`); };
    }

    // Call the function to open welcome windows at the end of initialization
    openWelcomeWindows(); 
} // End of initializeDesktop

// Start everything after fetching content
document.addEventListener('DOMContentLoaded', () => {
    fetchContent().then(() => {
        initializeDesktop(); 
    });
});