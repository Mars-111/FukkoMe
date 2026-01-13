import './App.css'
import { Routes, Route } from 'react-router-dom'
import UniversalError from './general/errors/UniversalError'
import { Login } from './auth/components/Login'
import { ProtectedOutlet } from './auth/components/ProtectedComponents'
import { UserInfoAndSubToUserRouter, UserInfoRouter } from './general/components/routers/UserInfoRouter';
import { UserSettings } from './users/components/UserSettings'
import { Register } from './auth/components/Register'
import { GeneralMenuOutlet } from './general/components/GeneralMenuOutlet'
import { useSocket } from './socket/useSocket'
import { useIdentity } from './auth/hooks/useIdentity'
import { MyInfo } from './users/components/MyInfo'
import { Welcome } from './general/components/Welcome'
import { MyChatsPage } from './general/components/MyChatsPage'
import { getMyChats } from './chats/utils/ChatUtils'
import { useEffect, useRef } from 'react'
import { MessengerLayout, MessengerLayoutSetter } from './layout/Layout'
import { ChatInfoRouter } from './general/components/routers/ChatInfoRouter'
import { MessagesRouter } from './general/components/routers/MessagesRouter'
import { useChatCacheMetaStore } from './chats/hooks/useChatCacheMetaStore'


function App() {   
    const { accessToken } = useIdentity(); // Инициализация аутентификации
    useSocket(); // Инициализация сокета
    const isFirstReauestMyChats = useRef<boolean>(true);

    useEffect(() => {
        if (!isFirstReauestMyChats.current || !accessToken) return;
        getMyChats(accessToken).then((chats) => {
            console.log("----------------------------------\n" +
                    "Иницилизация моих чатов\n" +
                    "Чаты: " + chats + "\n" +
                    "----------------------------------");
        }); // Иницилизируем наши чаты
        isFirstReauestMyChats.current = false;
    }, [accessToken]);

    return (
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/app" element={<ProtectedOutlet loadComponent={<h1>Loading auth...</h1>} />}>
                <Route element={<GeneralMenuOutlet />} >
                    <Route index element={<LayoutIndexPage />} />
                    {/* <Route path="search" element={<GlobalSearch />}>
                        <Route path="user/:id" element={<UserInfoRouter />} />
                    </Route> */}
                    <Route path="chat/:chatId" element={<LayoutSelectChatPage />} />
                    {/* <Route path="chat/:chatId/settings" element={<MessengerLayoutAndSet leftMainPanel={{ mainReactNode: <MyChatsPage /> }} centerMainPanel={{mainReactNode: <MessagesRouter />}} rightPanel={{mainReactNode: <ChatSettingsRouter />}} />} /> */}
                    <Route path="user/:userId" element={<LayoutSelectUserPage />} />
                    <Route path="user/me" element={<MyInfo />} />
                    <Route path="user/me/settings" element={<UserSettings />} />
                </Route>
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<UniversalError errorCode={404} />} />
        </Routes>
    )
}

export default App;


function LayoutIndexPage() {
    return (
        <>
            <MessengerLayoutSetter 
                mainPanels={{
                    left: {reactNode: <MyChatsPage />, name: "my chats"}
                }}
                selectTabIds={{
                    leftTabId: "main"
                }}
            />
            <MessengerLayout />
        </>
    );
}

function LayoutSelectChatPage() {
    return (
        <>
            <MessengerLayoutSetter 
                mainPanels={{
                    left: {reactNode: <MyChatsPage />, name: "my chats"},
                    center: {reactNode: <MessagesRouter />, name: "messages"},
                    right: {reactNode: <ChatInfoRouter countMembersDataPermissibleTimeDeviationMs={30*1000} membersDataPermissibleTimeDeviationMs={30*1000} />, name: "chat info"}
                }}
                selectTabIds={{
                    centerTabId: "main",
                    rightTabId: "main"
                }}
            />
            <MessengerLayout />
        </>
    );
}

function LayoutSelectUserPage() {
    return (
        <>
            <MessengerLayoutSetter 
                mainPanels={{
                    left: {reactNode: <MyChatsPage />, name: "my chats"},
                    center: {reactNode: <MessagesRouter />, name: "messages"},
                    right: {reactNode: <UserInfoAndSubToUserRouter />, name: "user info"}
                }}
                selectTabIds={{
                    rightTabId: "main"
                }}
            />
            <MessengerLayout />
        </>
    );
}