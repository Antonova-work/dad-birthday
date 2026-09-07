export default async function handler(req, res) {
  // Только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { museum, companions, date } = req.body;

  // Берем секретный токен из переменных окружения Vercel
  const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
  const TG_CHAT_ID = process.env.TG_CHAT_ID;

  if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const text = `🎉 *Папа собрал идеальный подарок!*\n\n🏛 *Музей:* ${museum}\n👥 *Компания:* ${companions}\n📅 *Дата:* ${date}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorData = await response.json();
      return res.status(500).json({ error: errorData.description });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}