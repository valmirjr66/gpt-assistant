import axiosInstance from './TelegramService';

async function getChatAnswer(messageObj, messageText) {
    return await axiosInstance.sendChatMessage(
        'api/assistant/conversations/message',
        {
            role: 'user',
            content: messageText,
            conversationId: messageObj.chat.id.toString(),
        },
    );
}

function sendMessage(messageObj, messageText) {
    return axiosInstance.get('sendMessage', {
        chat_id: messageObj.chat.id,
        text: messageText,
    });
}

function formatMessage(data) {
    let content = data.content.replace(/<sup>/g, '').replace(/<\/sup>/g, '');

    const citations = data.annotations
        .filter(
            (annotation) =>
                annotation.file_citation &&
                annotation.downloadURL &&
                annotation.displayName,
        )
        .map((annotation, index) => {
            return `[${index + 1}]. ${annotation.displayName} - ${annotation.downloadURL}`;
        });

    content += '\n\n' + citations.join('\n');

    return content;
}

async function handleMessage(messageObj) {
    const messageText = messageObj.text || '';

    if (messageText.charAt(0) === '/') {
        const command = messageText.substr(1);
        if (command == 'start') {
            return sendMessage(
                messageObj,
                "Hello, I'm the LENS bot. Ask me anything and i will help you find the answer. Don't forget that I can only read text, I'm not able to proccess images;",
            );
        } else {
            return sendMessage(
                messageObj,
                `Sorry, I don't understand this command, if you're trying to send a question, please remove the "/" and try again.`,
            );
        }
    } else {
        if (messageText !== '') {
            const chatMessage = await getChatAnswer(messageObj, messageText);
            const formattedMessage = formatMessage(chatMessage.data);
            return sendMessage(messageObj, formattedMessage);
        } else {
            return sendMessage(
                messageObj,
                "Your message doesn't have any text, please try again. Also is important to remember that i can't undestand images",
            );
        }
    }
}

export default handleMessage;
