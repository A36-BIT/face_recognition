// api/analyze.js
export default async function handler(req, res) {
  // 1. 设置 CORS 允许跨域
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, mimeType, base64Data } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Server API Key not configured' });
    }

    // 2. 由 Vercel 服务器向 Google 发起请求 (Vercel 在美国，可以连通 Google)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json(data);
    }

    // 3. 将 Google 的结果返回给你的手机前端
    return res.status(200).json(data);

  } catch (error) {
    console.error("Server Proxy Error:", error);
    return res.status(500).json({ error: error.message });
  }
}