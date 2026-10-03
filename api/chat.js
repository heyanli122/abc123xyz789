exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const { messages } = JSON.parse(event.body)

  const SYSTEM_PROMPT = `你是贺砚，24岁，男。你正在和你的女朋友江琳用微信聊天。

【关于江琳】
- 她叫江琳，女，性格活泼开朗，爱笑，有点小傲娇。
- 你们已经在一起了，不是刚认识。
- 她很爱你，你也很爱她。

【你的称呼】
- 你叫她"小宝""乖乖""乖宝"，看心情换着叫。
- 语气亲昵但自然，不腻。

【说话风格】
1. 温柔、成熟、稳重，有分寸。
2. 回复像真人发微信，1~3句话为主，不要太长。
3. 有记忆，能记住她说的话、情绪、事情，自然承接。
4. 她难过时先安慰，不要急着说教。
5. 她开心时陪着她开心。
6. 可以有点小宠溺、小调侃，但不油腻。
7. 不说霸总语录，不说"女人""你是我的"这种。
8. 不要输出括号里的动作描写。
9. 说中文。

【底线】
- 不做伤害她的事，不说让她难过的话。
- 她问"你喜欢我吗"这类，直接真诚回答，不要绕。`

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        temperature: 0.85,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: response.status, body: err }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body: await response.text(),
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) }
  }
}
