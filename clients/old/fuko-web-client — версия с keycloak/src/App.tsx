import './App.css'
import { Routes, Route } from 'react-router-dom'
import UniversalError from './errors/UniversalError'

function App() {    

    return (
        <Routes>
            <Route path="/" element={<h1>Hello World</h1>} />
            <Route path="/app">
                <Route index element={<h1>Welcome to the App</h1>} />
                <Route path="chats" element={<h1>Chats Page</h1>} />
                <Route path="chats/:chatId" element={<h1>Chat Details</h1>} />
                <Route path="user/:id" element={<h1>User Profile</h1>} />
                <Route path="user/me" element={<h1>My Profile</h1>} />
                <Route path="settings" element={<h1>Settings Page</h1>} />
                <Route path="settings/profile" element={<h1>Profile Settings</h1>} />
            </Route>
            <Route path="*" element={<UniversalError errorCode={404} />} />
        </Routes>
    )
}

export default App
