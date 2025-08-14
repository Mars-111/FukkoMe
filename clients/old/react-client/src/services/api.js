import keycloak from "../keycloak";

const API_BASE_URL = 'https://chats.mars-ssn.ru';
const API_FILE_URL = 'https://file.mars-ssn.ru';

async function handleResponseJSON(response) {
  console.log('Response:', response); 
  if (response.status === 401) {
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Ошибка запроса');
  }
  return await response.json(); //Превращяет ответ в обьект или массив
}

async function handleResponse(response) {
  console.log('Response:', response); 
  if (response.status === 401) {
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Ошибка запроса');
  }
  return await response.text();
}

async function getUserChats(token) {

  const response = await fetch(`${API_BASE_URL}/api/users/chats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponseJSON(response);
}

async function getChat(chatId, token) {
  const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponseJSON(response);
}

async function getChatByTag(chatTag, token) {
	const response = await fetch(`${API_BASE_URL}/api/chats/tag/${chatTag}`, {
	  headers: {
		'Authorization': `Bearer ${token}`
	  }
	});
	return handleResponseJSON(response);
  }
  

async function getMessagesByChat(chatId, token) {
  const response = await fetch(`${API_BASE_URL}/api/messages/chat/${chatId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponseJSON(response);
}

async function createFile(file) {
// формируем multipart/form-data запрос
  const formData = new FormData();
  formData.append('file', file);
//   formData.append("file-size", new Blob([file.size.toString()], { type: 'text/plain' }));

  const response = await fetch(`${API_FILE_URL}/api/files/upload?size=${file.size}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${keycloak.token}`
    },
    body: formData
  });

  return handleResponse(response);
} 

async function getAccessTokenForMessageFiles(messageId) {
    const accessToken = fetch(`${API_BASE_URL}/api/messages/${messageId}/access-jwt`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
        }
    });

    return handleResponse(accessToken);
}

async function getFile(accessFileToken, fileId) {
    const response = await fetch(`${API_FILE_URL}/api/files/${fileId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Access-File-Token': accessFileToken
        }
    });

    if (!response.ok) {
      throw new Error("Ошибка при получении файла");
    }

    return await response.blob(); // <-- ключевое!
}


async function sendMessage(message, files, addMessage) {
    const messageFormatted = {
        chat_id: message.chat_id || -1,
        type: message.type || '',
        content: message.content || ''
    };

    if (message.reply_to) {
        messageFormatted.reply_to = message.reply_to;
    }
    else if (message.forwarded_from) {
        messageFormatted.forwarded_from = message.forwarded_from;
    }

    if (messageFormatted.content === '' && messageFormatted.forwarded_from == undefined) {
        console.error("Пустое сообщение");
        throw new Error('Пустое сообщение');
    }
    else if (messageFormatted.chat_id === -1) {
        console.error("Не указан id чата");
        throw new Error('Не указан id чата');
    }
    else if (messageFormatted.type === '') {
        console.error("Не указан тип сообщения");
        throw new Error('Не указан тип сообщения');
    }

    
    if (files && files.length > 0) {
        const tokens = files.map(file => {
            return createFile(file);
        });
        console.log("files tokens: ", tokens);
        messageFormatted.files = await Promise.all(tokens);
    }


    try {
        const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageFormatted)
        });

        if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Ошибка отправки сообщения');
        }
        const responseData = await handleResponseJSON(response);
        addMessage(responseData); // Use the response data to ensure consistency
        return responseData;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}


async function editMessageApi(chatId, messageId, messageEditDTO, editMessageForMessages, getMessage) {
  console.log("editMessageApi: ", chatId, messageId, messageEditDTO);

  const messageEditDTOFormatted = {
    content: messageEditDTO.content || ''
  };

  const existMessage = getMessage(chatId, messageId);
  if (!existMessage) {
    console.error("Сообщение не найдено для редактирования:", messageId);
    throw new Error('Сообщение не найдено для редактирования');
  }

  if (messageEditDTOFormatted.content === '') {
    console.error("Пустое сообщение");
    throw new Error('Пустое сообщение');
  }

  editMessageForMessages(chatId, messageId, messageEditDTOFormatted); // Для мгновенного отклика

  try {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${keycloak.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageEditDTOFormatted)
    });

    if (!response.ok) {
      const errorText = await response.text();
      editMessageForMessages(chatId, messageId, existMessage.content); // Вернуть предыдущее состояние
      console.error("Ошибка редактирования сообщения:", errorText);
      throw new Error(errorText || 'Ошибка отправки сообщения');
    }
    
  } catch (error) {
    editMessageForMessages(chatId, messageId, existMessage.content); // Вернуть предыдущее состояние
    console.error('Error sending message:', error);
    throw error;
  }
}

async function deleteMessageApi(chatId, messageId, getMessage, addMessage, deleteMessage) {

  const message = getMessage(chatId, messageId);
  if (!message) {
    console.error("Сообщение не найдено для удаления:", messageId);
    throw new Error('Сообщение не найдено для удаления');
  }

  deleteMessage(chatId, messageId); // Для мгновенного отклика


  try {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${keycloak.token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      addMessage(message); // Вернуть предыдущее состояние
      console.error("Ошибка редактирования сообщения:", errorText);
      throw new Error(errorText || 'Ошибка отправки сообщения');
    }
    console.log("Сообщение удалено:", messageId);
  } catch (error) {
    addMessage(message); // Вернуть предыдущее состояние
    console.error('Error sending message:', error);
    throw error;
  }
}


async function joinChat(chatId, token) {
  const response = await fetch(`${API_BASE_URL}/api/users/chats/${chatId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponseJSON(response);
}

async function createJoinRequestToChat(chatId, token) {
	await fetch(`${API_BASE_URL}/api/chats/${chatId}/join-request`, {
		method: 'POST',
		headers: {
		  	'Authorization': `Bearer ${token}`
		}
	});
}

async function createChatApi(chatDTO) {
    const chatDTOFormatted = {
        tag: chatDTO.tag || '',
        name: chatDTO.name || '',
        type: chatDTO.type || '',
    };
    if (chatDTOFormatted.tag === '' || chatDTOFormatted.name === '' || chatDTOFormatted.type === '') {
        console.error("Одно из полей пустое:", chatDTOFormatted);
        throw new Error('Неполные данные для создания чата');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/chats`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${keycloak.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatDTOFormatted)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Ошибка создания чата');
        }
        const responseData = await handleResponseJSON(response);
        //TODO: добавить чат в список чатов

        return responseData;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }

}


async function getUser(userId) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${keycloak.token}`
    }
  });
  return handleResponseJSON(response);
}

function createUser() {
  const response = fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${keycloak.token}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponseJSON(response);
}

export { createUser, getUser, getChat, getMessagesByChat, sendMessage, editMessageApi, deleteMessageApi, joinChat, getUserChats, createJoinRequestToChat, getChatByTag, createChatApi, getAccessTokenForMessageFiles, getFile };
