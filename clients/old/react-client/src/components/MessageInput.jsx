import React, { useRef } from 'react';
import AddMediaButton from './addMediaButton';

function MessageInput({ onSend }) {
    const text = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // предотвращаем добавление \n
            handleSubmit();
        }
        // иначе (с Shift) \n добавится сам по себе
    };

    const handleSubmit = () => {
        const message = text.current.value;
        if (message.trim()) {
            onSend(message); // \n внутри строки сохранится
            text.current.value = '';
        }
    };

    return (
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
                ref={text}
                placeholder="Введите сообщение..."
                onKeyDown={handleKeyDown}
                style={{
                    resize: 'none',
                    padding: '10px',
                    minHeight: '60px',
                    fontFamily: 'inherit',
                    fontSize: '1em'
                }}
            />
            <button type="submit" onClick={handleSubmit} style={{ padding: '10px', marginTop: '5px' }}>
                Отправить
            </button>
            <AddMediaButton/>
        </form>
    );
}

export default MessageInput;
