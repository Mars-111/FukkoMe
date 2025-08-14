import { useAuth } from "./AuthContext";

export default function UserPreparationAfterRegistration() {
    const {user, userCreated} = useAuth();

    // Если пользователь создан, показываем радостную Мику
    if (userCreated) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                backgroundColor: '#f0f8ff',
                borderRadius: '10px',
                margin: '20px'
            }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                    ✨🎉✨
                </div>
                <h1 style={{ color: '#4a90e2', marginBottom: '10px' }}>
                    Добро пожаловать!
                </h1>
                <p style={{ fontSize: '18px', color: '#666' }}>
                    Ваш аккаунт успешно создан! 
                </p>
                <div style={{ 
                    fontSize: '60px', 
                    margin: '20px 0',
                    animation: 'bounce 2s infinite'
                }}>
                    🎵 Мику готова к работе! 🎵
                </div>
                <style jsx>{`
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-10px);
                        }
                        60% {
                            transform: translateY(-5px);
                        }
                    }
                `}</style>
            </div>
        );
    }

    // Функция для отображения статуса поля
    const getFieldStatus = (fieldValue) => {
        if (fieldValue === null || fieldValue === undefined) {
            return <span style={{ marginLeft: '10px', color: '#ffa500' }}>⏳</span>; // Загрузка
        } else if (fieldValue && fieldValue !== '') {
            return <span style={{ marginLeft: '10px', color: '#4caf50' }}>✅</span>; // Успешно
        } else {
            return <span style={{ marginLeft: '10px', color: '#f44336' }}>❌</span>; // Ошибка
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Подготавливаем пользователя</h1>
            <p>Это может занять до 30 секунд</p>
            
            <div style={{ 
                marginTop: '20px', 
                padding: '20px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
            }}>
                <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>Ваши данные:</p>
                
                <div style={{ marginBottom: '10px' }}>
                    <span>user id: </span>
                    {user.id ? (
                        <span>{user.id}</span>
                    ) : (
                        <span style={{ color: '#666' }}>загрузка...</span>
                    )}
                    {getFieldStatus(user.id)}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <span>username: </span>
                    {user.username ? (
                        <span>{user.username}</span>
                    ) : (
                        <span style={{ color: '#666' }}>загрузка...</span>
                    )}
                    {getFieldStatus(user.username)}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <span>email: </span>
                    {user.email ? (
                        <span>{user.email}</span>
                    ) : (
                        <span style={{ color: '#666' }}>загрузка...</span>
                    )}
                    {getFieldStatus(user.email)}
                </div>
            </div>
        </div>
    );
}