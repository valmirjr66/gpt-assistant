import axiosInstance from './TelegramService';

async function getChatAnswer(messageObj, messageText) {
    return await axiosInstance.sendChatMessage(
        'api/assistant/conversation/message', {
            role: "user",
            content: messageText,
            conversationId: messageObj.chat.id.toString()
        }
    );
}

function sendMessage(messageObj, messageText) {
    return axiosInstance.get("sendMessage", {
        chat_id: messageObj.chat.id,
        text: messageText,
        }
    );
}

async function handleMessage(messageObj) {
    const messageText = messageObj.text || "";

    if (messageText.charAt(0) === "/") {
        const command = messageText.substr(1)
        if (command == 'start') {
            return sendMessage(
                messageObj,
                "Oi, eu sou o chat bot da Witness. Pergunte qualquer coisa e irei te ajudar a encontrar uma resposta."
            );
        } else {
            return sendMessage(
                messageObj,
                "Desculpe, eu não conheço esse comando, caso esteja enviando uma pergunta, favor retirar a barra '/' do início da mensagem"
            );
        }
    } else {
        const chatMessage = await getChatAnswer(messageObj, messageText)
        return sendMessage(
            messageObj,
            chatMessage.data.content
        );
        // return sendMessage(
        //     messageObj,
        //     messageText
        // );
    }
}

export default handleMessage;