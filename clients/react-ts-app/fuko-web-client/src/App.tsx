import './App.css'
import { Routes, Route } from 'react-router-dom'
import UniversalError from './general/errors/UniversalError'
import { Login } from './auth/components/Login'
import { ProtectedOutlet } from './auth/components/ProtectedComponents'
import { UserInfoRouter } from './general/components/routers/UserInfoRouter';
import { UserSettings } from './users/components/UserSettings'
import { Register } from './auth/components/Register'
import { GeneralMenuOutlet } from './general/components/GeneralMenuOutlet'
import { useSocket } from './socket/useSocket'
import { useIdentity } from './auth/hooks/useIdentity'
import { MyInfo } from './users/components/MyInfo'
import { Welcome } from './general/components/Welcome'
import { GlobalSearch } from './general/components/GlobalSearch'
import { TestChatsPage } from './chats/components/TestChats'


function App() {   
    useIdentity(); // Инициализация аутентификации
    useSocket(); // Инициализация сокета

    return (
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/app" element={<ProtectedOutlet loadComponent={<h1>Loading auth...</h1>} />}>
                <Route element={<GeneralMenuOutlet />} >
                    <Route index element={<TestChatsPage />} />
                    <Route path="search" element={<GlobalSearch />}>
                        <Route path='user/:id' element={<UserInfoRouter />} />
                    </Route>
                    <Route path="chat/:chatId" element={<h1>Chat Details</h1>} />
                    <Route path="user/:id" element={<UserInfoRouter />} />
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
