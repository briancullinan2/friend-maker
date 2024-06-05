const fs = require('fs');
const OpenAIApi = require('openai')
const {OPENAI_AUTH} = require('./config.js');

function getOpenAI() {

  const configuration = {
    apiKey: JSON.parse(fs.readFileSync(OPENAI_AUTH).toString()),
    organization: 'org-F7SwcNQ3TPlaJZ4BmiCHxfD1',
    //project: 'proj_bu379o6a7TGJhiMEJRhBodou',
  }
  
  const openai = new OpenAIApi(configuration);
  return openai
}

const history = []

async function getMessageResponse(openai, message) {
  
  if(!openai) openai = getOpenAI()

  const messages = history.concat([])
  messages.push({role: 'user', content: message})

  // const stream = await openai.chat.completions.create({
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages,
    stream: false,
  })

  const completionText = completion.choices[0].message.content

  history.push({role: 'user', content: message})
  history.push({role: 'assistant', content: completionText})

  return history
}

module.exports = {
  getMessageResponse,
  getOpenAI,
  history
}

if(require.main === module && process.argv[1] == __filename) {
  getMessageResponse(null, 'please write a social media post for this article and dont include the link https://www.morningstar.com/news/pr-newswire/20240523mx21765/biossmann-snags-ai-thought-leader-pankaj-kedia-as-its-first-chief-ai-officer-and-board-member-to-fuel-the-next-phase-of-growth').then(client => {
    console.log(client)
  })
}
