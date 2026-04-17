
export function sendWhatsAppNotification(phone: string, message: string) {
  const encodedMsg = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encodedMsg}`;
  window.open(url, '_blank');
}

export function generateDailyReminder(name: string) {
  const messages = [
    `Hi ${name}! Ready for today's English challenge? Don't break your streak! 🔥`,
    `Hello! 15 minutes of study today will keep you on track for B2. Start now! 📚`,
    `Don't forget your Daily English Immersion, ${name}. Your future self will thank you. 🚀`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
