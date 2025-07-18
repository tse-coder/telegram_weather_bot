import { Telegraf } from "telegraf";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const weatherApiUrl = process.env.WEATHER_API_URL;
const weatherApiKey = process.env.WEATHER_API_KEY;

bot.start((ctx) =>
  ctx.reply(
    `🌦️ <b>Telegram Weather Bot</b>\n\n` +
      `This bot is made to showcase the working ability of the bot maker.\n` +
      `<b>Developer:</b> <i>Tsegaye Shewamare</i>\n\n` +
      `👋 Welcome!\nSend <b>/weather &lt;city&gt;</b> to get current weather.\nSend <b>/help</b> to get the available commands.`,
    { parse_mode: "HTML" }
  )
);

bot.help((ctx) =>
  ctx.reply(
    `🆘 <b>Help</b>\n\n` +
      `Available commands:\n` +
      `<b>/start</b> - Start the bot\n` +
      `<b>/help</b> - Show this help message\n` +
      `<b>/weather &lt;city&gt;</b> - Get current weather in a specified city\n` +
      `<b>/quit</b> - Leave the chat`,
    { parse_mode: "HTML" }
  )
);

bot.command("weather", (ctx) => {
  const city = ctx.message.text.split(" ")[1];
  if (!city) {
    ctx.reply("⚠️ Please provide a city name. Usage: /weather <city>", {
      parse_mode: "HTML",
    });
    return;
  }
  fetch(`${weatherApiUrl}?q=${city}&appid=${weatherApiKey}&units=metric`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      const weather = data.weather[0].description;
      const temp = data.main.temp;
      const feelsLike = data.main.feels_like;
      const humidity = data.main.humidity;
      const wind = data.wind.speed;
      const country = data.sys.country;
      const icon = data.weather[0].icon;
      const emoji =
        temp > 30 ? "🔥" : temp > 20 ? "🌤️" : temp > 10 ? "🌦️" : "❄️";
      ctx.reply(
        `${emoji} <b>Weather in ${city}, ${country}</b>\n` +
          `<b>Description:</b> ${
            weather.charAt(0).toUpperCase() + weather.slice(1)
          }\n` +
          `<b>Temperature:</b> ${temp}°C (Feels like ${feelsLike}°C)\n` +
          `<b>Humidity:</b> ${humidity}%\n` +
          `<b>Wind Speed:</b> ${wind} m/s\n` +
          `<b>Icon:</b> <a href='http://openweathermap.org/img/wn/${icon}@2x.png'>🌦️</a>`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    })
    .catch((error) => {
      ctx.reply(`❌ <b>Error fetching weather data:</b> ${error.message}`, {
        parse_mode: "HTML",
      });
    });
});

bot.on("text", (ctx) => {
  if (ctx.message.text.toLowerCase() === "hello") {
    ctx.reply("👋 <b>Hello world!</b>", { parse_mode: "HTML" });
    return;
  }
  ctx.reply(`💬 <b>You said:</b> ${ctx.message.text}`, { parse_mode: "HTML" });
});

bot.command("quit", (ctx) => {
  ctx.reply("👋 <b>You have left the chat.</b>", { parse_mode: "HTML" });
});

bot.catch((err, ctx) => {
  console.error(`Bot Error for ${ctx.updateType}`, err);
});
//express server for health check
const app = express();
app.get("/", (req, res) => {
  res.send("Telegram Weather Bot is running");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
(async () => {
  try {
    await bot.launch();
    console.log("Bot is running");
  } catch (error) {
    console.error("Failed to launch bot:", error);
  }
})();
// Graceful stop
process.once("SIGINT", () => {
  console.log("Received SIGINT, stopping bot...");
  bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
  console.log("Received SIGTERM, stopping bot...");
  bot.stop("SIGTERM");
});
