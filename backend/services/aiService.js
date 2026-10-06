const Groq = require("groq-sdk");

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not configured"
    );
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

const generateAIResponse = async ({
  instructions,
  input,
}) => {
  const groq = getGroqClient();

  const completion =
    await groq.chat.completions.create({
      model:
	  process.env.GROQ_MODEL ||
	  "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: input,
        },
      ],

      temperature: 0.3,
    });

  const text =
    completion.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error(
      "Groq did not return a response"
    );
  }

  return text;
};

module.exports = {
  generateAIResponse,
};