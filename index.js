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
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: question }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.send({ answer: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to get response from Groq' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
