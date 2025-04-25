import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

let chatHistory = [];

export async function getResponse(userInput) {
  if (!userInput.trim()) return "⚠ Please enter a valid question.";

  if (userInput.toLowerCase().includes("weather")) {
    return await getWeather(userInput);
  }
  if (userInput.toLowerCase().includes("time") || userInput.toLowerCase().includes("date")) {
    return getTime();
  }
  if (userInput.toLowerCase().includes("wikipedia")) {
    return await wikiSearch(userInput);
  }

  return await callGroq(userInput);
}

async function callGroq(userInput) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return "❌ Groq API key not set.";

  chatHistory.push({ role: "user", content: userInput });

  const payload = {
    model: "llama3-8b-8192",
    messages: [{ role: "system", content: "You are a helpful assistant." }, ...chatHistory]
  };

  try {
    const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    const content = res.data.choices[0].message.content.trim();
    chatHistory.push({ role: "assistant", content });
    return content;
  } catch (err) {
    return `❌ Failed to contact Groq: ${err.message}`;
  }
}

function getTime() {
  const now = new Date();
  return `🕒 Current time is: ${now.toLocaleString()}`;
}

async function getWeather(input) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) return "❌ Weather API key not set.";

  const match = input.toLowerCase().match(/in\s+(.+)/);
  const location = match ? match[1].trim() : "Chennai";

  try {
    const res = await axios.get("http://api.openweathermap.org/data/2.5/weather", {
      params: { q: location, appid: apiKey, units: "metric" }
    });
    const weather = res.data.weather[0].description;
    const temp = res.data.main.temp;
    return `🌤 Weather in ${location}: ${weather}, ${temp}°C`;
  } catch (e) {
    return `⚠ Could not fetch weather: ${e.response?.data?.message || e.message}`;
  }
}

async function wikiSearch(input) {
  const topic = input.replace(/wikipedia/i, "").trim();
  try {
    const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
    return `📚 Wikipedia: ${res.data.extract}`;
  } catch (e) {
    return `❌ Wikipedia error: ${e.message}`;
  }
}
