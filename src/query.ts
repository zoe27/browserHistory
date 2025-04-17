import { getLlama, LlamaChatSession } from "node-llama-cpp";

async function run() {
  const llama = await getLlama();

  const model = await llama.loadModel({
    modelPath: "/Users/zoe/Documents/web3/ai-agent/zoe/eliza/agent/model.gguf",
  });

  const context = await model.createContext();

  const session = new LlamaChatSession({
    contextSequence: context.getSequence()
  });

  const q1 = "Hi there, how are you?";
  console.log("User: " + q1);

  const a1 = await session.prompt(q1);
  console.log("AI: " + a1);
}

run().catch(console.error);
