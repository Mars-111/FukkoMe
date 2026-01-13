import type { ReactNode } from "react";
import React from "react";
import { create } from "zustand";


export type MessengerLayoutPanelType = {
    reactNode: ReactNode | null;
    name: string;
    onClose?: () => void;
};

export type LayoutTabIdType = "main" | number | null;

export type LayoutSideType = "left" | "center" | "right";

export type MessengerLayoutType = {
    mainNode: MessengerLayoutPanelType | null;
    defaultNode: MessengerLayoutPanelType | null;
    tabNodes: MessengerLayoutPanelType[];
    selectedTabId: LayoutTabIdType;
    side: LayoutSideType;
    setSelectedTabId: (tabId: LayoutTabIdType) => void;
    setSelectedTabIdByName: (name: string) => void;
    setMainNode: (panel: MessengerLayoutPanelType | null) => void;
    setDefaultNode: (panel: MessengerLayoutPanelType | null) => void;
    addTabNode: (panel: MessengerLayoutPanelType, select?: boolean) => void;
    addTabNodes: (panel: MessengerLayoutPanelType[]) => void;
    deleteTabNode: (tabId: number) => void;
    deleteTabNodeByName: (name: string) => void;
};

export type MessengerLayoutStoreType = {
    leftPanel: MessengerLayoutType;
    centerPanel: MessengerLayoutType;
    rightPanel: MessengerLayoutType;
};


const shouldUpdate = (current: ReactNode | null, added: ReactNode | null) => {
    if (current == null && added == null) return false;
    if (current == null && added != null) return true;
    if (current != null && added == null) return true;
    // Если ссылка на ReactNode не изменилась — не обновляем
    if (current === added) return false;
    // Можно добавить более глубокую проверку
    if (React.isValidElement(current) && React.isValidElement(added)) {
        // например, можно сравнивать тип и ключ элемента
        return current.type !== added.type ||
           current.key !== added.key;
    }
    return true;
};

export const useMessengerLayoutStore = create<MessengerLayoutStoreType>((set, get) => { 

    function setSelectedTabId(side: LayoutSideType, tabId: LayoutTabIdType): void {
        if (side === "left") {
            set((state) => {
                return { leftPanel: { ...state.leftPanel, selectedTabId: tabId } };
            });
        }
        else if (side === "center") {
            set((state) => {
                return { centerPanel: { ...state.centerPanel, selectedTabId: tabId } };
            });
        }
        else if (side === "right") {
            set((state) => {
                return { rightPanel: { ...state.rightPanel, selectedTabId: tabId } };
            });
        }
    }

    function setSelectedTabIdByName(side: LayoutSideType, name: string): void {
        if (side === "left") {
            set((state) => {
                const index = state.leftPanel.tabNodes.findIndex(p => p.name === name);
                if (index !== -1) {
                    return { leftPanel: { ...state.leftPanel, selectedTabId: index } };
                }
                return {};
            });
        }
        else if (side === "center") {
            set((state) => {
                const index = state.centerPanel.tabNodes.findIndex(p => p.name === name);
                if (index !== -1) {
                    return { centerPanel: { ...state.centerPanel, selectedTabId: index } };
                }
                return {};
            });
        }
        else if (side === "right") {
            set((state) => {
                const index = state.rightPanel.tabNodes.findIndex(p => p.name === name);
                if (index !== -1) {
                    return { rightPanel: { ...state.rightPanel, selectedTabId: index } };
                }
                return {};
            });
        }
    }
                

    function setMainNode(side: LayoutSideType, panel: MessengerLayoutPanelType | null): void {
        if (side === "left") {
            set((state) => {
                if (state.leftPanel.mainNode === null || shouldUpdate(state.leftPanel.mainNode.reactNode, panel?.reactNode)) {
                    const newLeftPanel = { ...state.leftPanel, mainNode: panel };
                
                    return { leftPanel: newLeftPanel };
                } 
                return { };
            })
        }    
        else if (side === "center") {
            set((state) => {
                if (state.centerPanel.mainNode === null || shouldUpdate(state.centerPanel.mainNode.reactNode, panel?.reactNode)) {
                    const newCenterPanel = { ...state.centerPanel, mainNode: panel };
                    return { centerPanel: newCenterPanel };
                }
                return { };
            })
        }
        else if (side === "right") {
            set((state) => {
                if (state.rightPanel.mainNode === null || shouldUpdate(state.rightPanel.mainNode.reactNode, panel?.reactNode)) {
                    const newRightPanel = { ...state.rightPanel, mainNode: panel };
                    return { rightPanel: newRightPanel };
                }
                return { };
            })
        }
    }

    function setDefaultNode(side: LayoutSideType, panel: MessengerLayoutPanelType | null): void {
        if (side === "left") {
            set((state) => ({ leftPanel: { ...state.leftPanel, defaultNode: panel } }));
        }
        else if (side === "center") {
            set((state) => ({ centerPanel: { ...state.centerPanel, defaultNode: panel } }));
        }
        else if (side === "right") {
            set((state) => ({ rightPanel: { ...state.rightPanel, defaultNode: panel } }));
        }
    }

    function addTabNode(side: LayoutSideType, panel: MessengerLayoutPanelType, select: boolean = false): void {
        if (side === "left") {
            set((state) => {
                if (state.leftPanel.tabNodes.some(p => p.name === panel.name)) {
                    console.log("Tab already exists in left panel, not adding:", panel.name);
                    return {};
                }
                const newTabs = [...state.leftPanel.tabNodes, panel];
                console.log("Successfully added tab to left panel: ", panel.name);
                const newState = { leftPanel: { ...state.leftPanel, tabNodes: newTabs, selectedTabId: select ? newTabs.length - 1 : state.leftPanel.selectedTabId } };
                return newState;
            });
        }
        else if (side === "center") {
            set((state) => {
                if (state.centerPanel.tabNodes.some(p => p.name === panel.name)) {
                    console.log("Tab already exists in center panel, not adding:", panel.name);
                    return {};
                }
                const newTabs = [...state.centerPanel.tabNodes, panel];
                console.log("Successfully added tab to center panel: ", panel.name);
                const newState = { centerPanel: { ...state.centerPanel, tabNodes: newTabs, selectedTabId: select ? newTabs.length - 1 : state.centerPanel.selectedTabId } };
                return newState;
            });
        }
        else if (side === "right") {
            set((state) => {
                if (state.rightPanel.tabNodes.some(p => p.name === panel.name)) {
                    console.log("Tab already exists in right panel, not adding:", panel.name);
                    return {};
                }
                const newTabs = [...state.rightPanel.tabNodes, panel];
                console.log("Successfully added tab to right panel: ", panel.name);
                const newState = { rightPanel: { ...state.rightPanel, tabNodes: newTabs, selectedTabId: select ? newTabs.length - 1 : state.rightPanel.selectedTabId } };
                return newState;
            });
        }
    }

    function addTabNodes(side: LayoutSideType, panels: MessengerLayoutPanelType[]): void {
        if (side === "left") {
            set((state) => {
                const newTabs = [...state.leftPanel.tabNodes];
                for (const panel of panels) {
                    if (!state.leftPanel.tabNodes.some(p => p.name === panel.name)) {
                        newTabs.push(panel);
                    }
                    else {
                        console.log("Tab already exists in left panel, not adding:", panel.name);
                    }
                }
                if (newTabs.length === state.leftPanel.tabNodes.length) {
                    return {};
                }
                console.log("Successfully added tab(s)) to left panel: ", panels.map(p => p.name));
                return { leftPanel: { ...state.leftPanel, tabNodes: newTabs } };
            });
        }
        else if (side === "center") {
            set((state) => {
                const newTabs = [...state.centerPanel.tabNodes];
                for (const panel of panels) {
                    if (!state.centerPanel.tabNodes.some(p => p.name === panel.name || shouldUpdate(p.reactNode, panel.reactNode))) {
                        newTabs.push(panel);
                    }
                }
                if (newTabs.length === state.centerPanel.tabNodes.length) {
                    return {};
                }
                return { centerPanel: { ...state.centerPanel, tabNodes: newTabs } };
            });
        }
        else if (side === "right") {
            set((state) => {
                const newTabs = [...state.rightPanel.tabNodes];
                for (const panel of panels) {
                    if (!state.rightPanel.tabNodes.some(p => p.name === panel.name || shouldUpdate(p.reactNode, panel.reactNode))) {
                        newTabs.push(panel);
                    }
                }
                if (newTabs.length === state.rightPanel.tabNodes.length) {
                    return {};
                }
                return { rightPanel: { ...state.rightPanel, tabNodes: newTabs } };
            });
        }
    }

    function deleteTabNode(side: LayoutSideType, tabId: number): void {
        if (side === "left") {
            set((state) => {
                const selectedTabId = state.leftPanel.selectedTabId;
                state.leftPanel.tabNodes[tabId]?.onClose?.();
                const newTabs = state.leftPanel.tabNodes.filter((_, i) => i !== tabId);
                return { leftPanel: { ...state.leftPanel, tabNodes: newTabs, selectedTabId: selectedTabId === tabId ? "main" : state.leftPanel.selectedTabId } };
            });
        }
        else if (side === "center") {
            set((state) => {
                const selectedTabId = state.centerPanel.selectedTabId;
                state.centerPanel.tabNodes[tabId]?.onClose?.();
                const newTabs = state.centerPanel.tabNodes.filter((_, i) => i !== tabId);
                return { centerPanel: { ...state.centerPanel, tabNodes: newTabs, selectedTabId: selectedTabId === tabId ? "main" : state.centerPanel.selectedTabId } };
            });
        }
        else if (side === "right") {
            set((state) => {
                const selectedTabId = state.rightPanel.selectedTabId;
                state.rightPanel.tabNodes[tabId]?.onClose?.();
                const newTabs = state.rightPanel.tabNodes.filter((_, i) => i !== tabId);
                return { rightPanel: { ...state.rightPanel, tabNodes: newTabs, selectedTabId: selectedTabId === tabId ? "main" : state.rightPanel.selectedTabId } };
            });
        }
    }

    function deleteTabNodeByName(side: LayoutSideType, name: string): void {
        if (side === "left") {
            set((state) => {
                const newTabs = state.leftPanel.tabNodes.filter((p) => p.name !== name);
                return { leftPanel: { ...state.leftPanel, tabNodes: newTabs } };
            });
        }
        else if (side === "center") {
            set((state) => {
                const newTabs = state.centerPanel.tabNodes.filter((p) => p.name !== name);
                return { centerPanel: { ...state.centerPanel, tabNodes: newTabs } };
            });
        }
        else if (side === "right") {
            set((state) => {
                const newTabs = state.rightPanel.tabNodes.filter((p) => p.name !== name);
                return { rightPanel: { ...state.rightPanel, tabNodes: newTabs } };
            });
        }
    }

    return {
        leftPanel: { 
            mainNode: null, 
            defaultNode: null, 
            selectedTabId: "main", 
            side: "left", 
            tabNodes: [], 
            setSelectedTabId: (tabId) => setSelectedTabId("left", tabId), 
            setSelectedTabIdByName: (name) => setSelectedTabIdByName("left", name),
            setMainNode: (panel) => setMainNode("left", panel),
            setDefaultNode: (panel) => setDefaultNode("left", panel),
            addTabNode: (panel, select) => addTabNode("left", panel, select),
            addTabNodes: (panels) => addTabNodes("left", panels),
            deleteTabNode: (tabId) => deleteTabNode("left", tabId),
            deleteTabNodeByName: (name) => deleteTabNodeByName("left", name),
        },
        centerPanel: { 
            mainNode: null, 
            defaultNode: null, 
            selectedTabId: "main", 
            tabNodes: [], 
            side: "center", 
            setSelectedTabId: (tabId) => setSelectedTabId("center", tabId), 
            setSelectedTabIdByName: (name) => setSelectedTabIdByName("center", name),
            setMainNode: (panel) => setMainNode("center", panel),
            setDefaultNode: (panel) => setDefaultNode("center", panel),
            addTabNode: (panel, select) => addTabNode("center", panel, select),
            addTabNodes: (panels) => addTabNodes("center", panels),
            deleteTabNode: (tabId) => deleteTabNode("center", tabId),
            deleteTabNodeByName: (name) => deleteTabNodeByName("center", name),
        },
        rightPanel: { 
            mainNode: null, 
            defaultNode: null, 
            selectedTabId: "main", 
            tabNodes: [], 
            side: "right", 
            setSelectedTabId: (tabId) => setSelectedTabId("right", tabId), 
            setSelectedTabIdByName: (name) => setSelectedTabIdByName("right", name),
            setMainNode: (panel) => setMainNode("right", panel),
            setDefaultNode: (panel) => setDefaultNode("right", panel),
            addTabNode: (panel, select) => addTabNode("right", panel, select),
            addTabNodes: (panels) => addTabNodes("right", panels),
            deleteTabNode: (tabId) => deleteTabNode("right", tabId),
            deleteTabNodeByName: (name) => deleteTabNodeByName("right", name),
        },  
    };

});