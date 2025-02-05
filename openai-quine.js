const fs = require('fs');
const {OPENAI_AUTH} = require('./config.js');
const OpenAIApi = require('openai');

async function askChatGPTToWriteFunction(apiKey) {
  const openai = new OpenAIApi({
    apiKey: apiKey,
    organization: 'org-F7SwcNQ3TPlaJZ4BmiCHxfD1',
    //project: 'proj_bu379o6a7TGJhiMEJRhBodou',
  });

  const prompt = `
  Write a function that asks ChatGPT to write a function. The function should send a request to ChatGPT with a prompt to generate code for a specific task.
  `;

  const response = await openai.chat.completions.create({
    messages: [{role: 'user', content: prompt}],
    model: 'gpt-4o',
  });

  return response.choices[0].message.content;
}

async function main() {
  const apiKey = JSON.parse(fs.readFileSync(OPENAI_AUTH).toString());
  const functionCode = await askChatGPTToWriteFunction(apiKey);
  console.log('Generated function code:\n', functionCode);
}

main().catch(console.error);