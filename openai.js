const { Configuration, OpenAIApi } = require("openai");

class OpenAI {
  constructor(apiKey) {
    this.openai = new OpenAIApi(new Configuration({ apiKey }));
  }

  async generatePoem(poet, mood, topic) {
    const completion = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Generate a ${mood} poem on ${topic} in ${poet} style`,
      max_tokens: 1024,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    return completion.data.choices[0].text;
  }
}

module.exports = { OpenAI };