const TELEGRAM_BOT_TOKEN = '8556181877:AAHdPJjCmLjXuNg7adnb-BRiOqAZKjUfgaE';
const TELEGRAM_CHAT_ID = '5478197533';

export const sendToTelegram = async (data) => {
  const text = `
🚀 **Новая заявка с сайта!**
👤 **Имя:** ${data.name}
📧 **Email:** ${data.email}
📞 **Телефон:** ${data.phone}
🏢 **Компания:** ${data.company || 'Не указана'}
🔧 **Тип проекта:** ${data.projectType}
💰 **Бюджет:** ${data.budget || 'Не указан'}
💳 **Платёжная система:** ${data.paymentSystem || 'Не выбрана'}
📱 **Способ связи:** ${data.contactMethod}
📝 **Описание:** ${data.message}
  `;

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' }),
  });

  if (!response.ok) {
    throw new Error('Telegram send failed');
  }
  return response.json();
};