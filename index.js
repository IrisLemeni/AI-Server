require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).send({ error: 'Question required' });

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo', // sau 'gpt-4' dacă ai acces
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant. Use markdown formatting: headings (##, ###), bold (**), and bullet points.`
        },
        {
          role: 'user',
          content: question
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.send({ answer: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).send({ error: 'Failed to get response from OpenAI' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
