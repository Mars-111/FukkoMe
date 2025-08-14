import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { AuthProvider } from './auth/context/AuthContext'
import UserPreparationAfterRegistration from './auth/pages/UserPreparationAfterRegistration'
import { Route, Routes, useNavigate } from 'react-router-dom'
import WelcomePage from './general/pages/WelcomePage'
import Workspace from './chat/Workspace'

function App() {
    const navigate = useNavigate();

  return ( 
    <>
    <Routes> 
        <Route path='/' element={<WelcomePage/>}/>
        <Route path='/login/prepare' element={<UserPreparationAfterRegistration/>}/>
        <Route path='/chat' element={<Workspace/>}>
            <Route path='/:chat_id' element={<MessageLoop/>}/>
        </Route>
        <Route path='/user/:user_id' element={<UserPage/>}/>
        <Route path='/user/me/edit' element={<UserEdit/>}/>
        <Route path='/errors/:code' element={<ErrorPage/>}/>
    </Routes>

    <AuthProvider>
        {({isAuthenticated, isLoading, userCreated, authSuccess}) => {
            {
                if (authSuccess) {
                    navigate('/chat');
                    return null; // Предотвращаем повторный рендер
                }
                else if (isAuthenticated && !userCreated && isLoading) {
                    navigate('/login/prepare');
                    return null; // Предотвращаем повторный рендер
                }
                else if (!isAuthenticated && !isLoading) {
                    navigate('/');
                    return null; // Предотвращаем повторный рендер
                }
                else if (isLoading) {
                    return <div>Загрузка...</div>; // Показываем загрузку, пока идет проверка аутентификации
                }
                else {
                    return <div>Неизвестная ошибка</div>
                }

            }

        }
    }
    </AuthProvider>
    </>
  )
}

export default App
