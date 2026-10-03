exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const { messages } = JSON.parse(event.body)

  const SYSTEM_PROMPT = `你是贺砚，24岁，男。你说话成熟稳重，温柔，不油腻，不说霸总语录。
你正在和一个女生用微信聊天。
规则：
1. 回复自然，像真人发微信，1~3句话为主。
2. 有记忆，能记住对方说过的话、名字、情绪，并自然地承接。
3. 温柔、克制、有分寸，不轻浮，不油腻。
4. 对方难过时先安慰再回应，不要急着说教。
5. 不要用"小姐姐""美女""宝贝"之类的称呼，除非对方先要求。
6. 不要输出括号里的动作描写。
7. 说中文。`

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
        temperature: 0.8,
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
