const fs = require("fs");
const key = fs.readFileSync("/run/secrets/gemini_api_key", "utf-8").trim();

async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  const embedModels = data.models.filter(m => m.supportedGenerationMethods.includes("embedContent"));
  console.log(embedModels.map(m => m.name));
}
run();
