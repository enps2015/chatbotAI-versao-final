const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const fs = require("fs");
const key = fs.readFileSync("/run/secrets/gemini_api_key", "utf-8").trim();

async function test(model) {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: key,
      model: model,
    });
    console.log("Testing model:", model);
    const res = await embeddings.embedQuery("hello");
    console.log("Success with length:", res.length);
  } catch (e) {
    console.error("Failed for model:", model, e.message);
  }
}

async function run() {
  await test("text-embedding-004");
  await test("embedding-001");
  await test("models/text-embedding-004");
  await test("models/embedding-001");
}
run();
