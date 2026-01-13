import { useCallback, useEffect, useMemo, useRef, type JSX } from 'react';
import './layout.css';
import { useMessengerLayoutStore, type LayoutTabIdType, type MessengerLayoutPanelType, type MessengerLayoutStoreType, type MessengerLayoutType } from './messengerLayoutStore';
import { useSearchParams } from 'react-router-dom';
import { ChatCreate } from '../chats/components/ChatCreate';


function LayoutTab({ panel, tabId, text }: { panel: MessengerLayoutType, tabId: LayoutTabIdType, text?: string } ) {
	
	const onSelect = () => panel.setSelectedTabId(tabId);
	
    const onClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (tabId !== "main") {
            panel.deleteTabNode(tabId as number);
        }
    };
	
	const tabText =
        text ??
        (tabId === "main"
            ? panel.mainNode?.name || "Main"
            : panel.tabNodes[tabId as number]?.name || `Tab ${tabId}`);

	
	const isActive = panel.selectedTabId === tabId;

	
    return (
        <div
            className={`layout-tab ${isActive ? "active" : ""}`}
            onClick={onSelect}
        >
            <span className="layout-tab-text">{tabText}</span>
            {tabId !== "main" && (
                <button className="layout-tab-close" onClick={onClose}>×</button>
            )}
        </div>
    );
}

export function MessengerLayout() {
	const leftPanel = useMessengerLayoutStore(state => state.leftPanel);
	const centerPanel = useMessengerLayoutStore(state => state.centerPanel);
	const rightPanel = useMessengerLayoutStore(state => state.rightPanel);

    return (
		<div className="layout-wrapper">
			<div className="messenger-layout">
				<div className="layout-left">
					<div className="layout-left-tabs">
						{leftPanel.mainNode?.reactNode && (leftPanel.tabNodes.length > 0 || leftPanel.selectedTabId !== "main") && <LayoutTab panel={leftPanel} tabId={"main"} />}
						{leftPanel.tabNodes.map((tab, index) => (
							<LayoutTab key={index} panel={leftPanel} tabId={index} />
						))}
					</div>
					<div className="layout-panel">
						{leftPanel.selectedTabId === "main" ? leftPanel.mainNode?.reactNode : leftPanel.tabNodes[leftPanel.selectedTabId as number]?.reactNode}
					</div>
				</div>
				<div className="layout-center">
					<div className="layout-center-tabs">
						{centerPanel.mainNode?.reactNode && (centerPanel.tabNodes.length > 0 || centerPanel.selectedTabId !== "main") && <LayoutTab panel={centerPanel} tabId={"main"} />}
						{centerPanel.tabNodes.map((tab, index) => (
							<LayoutTab key={index} panel={centerPanel} tabId={index} />
						))}
					</div>
					<div className="layout-panel">
						{centerPanel.selectedTabId === "main" ? centerPanel.mainNode?.reactNode : centerPanel.tabNodes[centerPanel.selectedTabId as number]?.reactNode}
					</div>
				</div>
				<div className="layout-right">
					<div className="layout-right-tabs">
						{rightPanel.mainNode?.reactNode && (rightPanel.tabNodes.length > 0 || rightPanel.selectedTabId !== "main") && <LayoutTab panel={rightPanel} tabId={"main"} />}
						{rightPanel.tabNodes.map((tab, index) => (
							<LayoutTab key={index} panel={rightPanel} tabId={index} />
						))}
					</div>
					<div className="layout-panel">
						{rightPanel.selectedTabId === "main" ? rightPanel.mainNode?.reactNode : rightPanel.tabNodes[rightPanel.selectedTabId as number]?.reactNode}
					</div>
				</div>
			</div>
		</div>
	);
}

export function MessengerLayoutSetter({mainPanels, addTabPanels, selectTabIds, defaultPanels}: {
	mainPanels?: {
		left?: MessengerLayoutPanelType;
		center?: MessengerLayoutPanelType;
		right?: MessengerLayoutPanelType;
	};
	addTabPanels?: {
		left?: MessengerLayoutPanelType[];
		center?: MessengerLayoutPanelType[];
		right?: MessengerLayoutPanelType[];
	};
	selectTabIds?: {
		leftTabId?: LayoutTabIdType;
		centerTabId?: LayoutTabIdType;
		rightTabId?: LayoutTabIdType;
		leftTabIdByName?: string;
		centerTabIdByName?: string;
		rightTabIdByName?: string;
	};
	defaultPanels?: {
		left?: MessengerLayoutPanelType;
		center?: MessengerLayoutPanelType;
		right?: MessengerLayoutPanelType;
	};
}) {
	const leftPanel = useMessengerLayoutStore(state => state.leftPanel)
	const centerPanel = useMessengerLayoutStore(state => state.centerPanel)
	const rightPanel = useMessengerLayoutStore(state => state.rightPanel)
	const initializedRef = useRef(false);

	useEffect(() => {
		if (initializedRef.current) return;
		initializedRef.current = true;
		if (mainPanels?.left) {
			leftPanel.setMainNode(mainPanels.left);
		}
		if (mainPanels?.center) {
			centerPanel.setMainNode(mainPanels.center);
		}
		if (mainPanels?.right) {
			rightPanel.setMainNode(mainPanels.right);
		}

		if (addTabPanels?.left) {
			leftPanel.addTabNodes(addTabPanels.left);
		}
		if (addTabPanels?.center) {
			centerPanel.addTabNodes(addTabPanels.center);
		}
		if (addTabPanels?.right) {
			rightPanel.addTabNodes(addTabPanels.right);
		}

		if (selectTabIds !== undefined) {
			if (selectTabIds.leftTabId !== undefined) {
				leftPanel.setSelectedTabId(selectTabIds.leftTabId);
			}
			else if (selectTabIds.leftTabIdByName) {
				leftPanel.setSelectedTabIdByName(selectTabIds.leftTabIdByName);
			}

			if (selectTabIds?.centerTabId !== undefined) {
				centerPanel.setSelectedTabId(selectTabIds.centerTabId);
			}
			else if (selectTabIds.centerTabIdByName) {
				centerPanel.setSelectedTabIdByName(selectTabIds.centerTabIdByName);
			}

			if (selectTabIds?.rightTabId !== undefined) {
				rightPanel.setSelectedTabId(selectTabIds.rightTabId);
			}
			else if (selectTabIds.rightTabIdByName) {
				rightPanel.setSelectedTabIdByName(selectTabIds.rightTabIdByName);
			}

			if (defaultPanels?.left !== undefined) {
				leftPanel.setDefaultNode(defaultPanels.left);
			}
			if (defaultPanels?.center !== undefined) {
				centerPanel.setDefaultNode(defaultPanels.center);
			}
			if (defaultPanels?.right !== undefined) {
				rightPanel.setDefaultNode(defaultPanels.right);
			}
		}
	}, []);

	return null;
}
