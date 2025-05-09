require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(express.json());
app.use(cors());

app.post('/ask', async (req, res) => {
  const { question, userId } = req.body;

  if (!question || !userId) {
    return res.status(400).send({ error: 'Question and userId are required' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful task management assistant. Use markdown formatting: headings (##, ###), bold (**), and bullet points.`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const answer = response.data.choices[0].message.content;

    // 🔥 Salvare în Firestore
    await db
      .collection('conversations')
      .doc(userId)
      .collection('messages')
      .add({
        question,
        answer,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.send({ answer });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).send({ error: 'Failed to get response from OpenAI' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
