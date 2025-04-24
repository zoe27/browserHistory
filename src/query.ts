import { getLlama, LlamaChatSession } from "node-llama-cpp";

const llama = await getLlama();

const model = await llama.loadModel({
  modelPath: "/Users/zoe/Documents/web3/ai-agent/zoe/eliza/agent/model.gguf",
  // modelPath: "./model/phi-2_Q4_K_M.gguf",

});


const context = await model.createContext();

const session = new LlamaChatSession({
  contextSequence: context.getSequence()
});

const q1 = "如何解决执行力比较弱的问题";
console.log("User: " + q1);

const a1 = await session.prompt(q1);
console.log("AI: " + a1);
