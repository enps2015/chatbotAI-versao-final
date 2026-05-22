const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const fs = require("fs");
const key = fs.readFileSync("/run/secrets/gemini_api_key", "utf-8").trim();

async function test(model) {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: key,
      model: model,
    });
    const res = await embeddings.embedQuery("hello");
    console.log("Success with", model, res.length);
  } catch (e) {
    console.error("Failed for", model, e.message);
  }
}

async function run() {
  await test("text-embedding-004");
}
run();
