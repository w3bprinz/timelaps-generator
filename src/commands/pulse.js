import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("pulse")
    .setDescription("Zeigt aktuelle Sensordaten vom Pulse Grow Pulse Pro an")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const allowedChannelId = process.env.PULSE_CHANNEL_ID;
    const deviceId = process.env.PULSE_DEVICE_ID;
    const apiKey = process.env.PULSE_API_KEY;

    if (interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content: "❌ Dieser Befehl darf nur im dafür vorgesehenen Channel ausgeführt werden.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const response = await fetch(`https://api.pulsegrow.com/devices/${deviceId}/recent-data`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
      });

      if (!response.ok) {
        return interaction.reply({
          content: "⚠️ Fehler beim Abrufen der Daten von Pulse Grow.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const data = await response.json();

      const embed = new EmbedBuilder()
        .setTitle("🌿 Pulse Grow Sensordaten")
        .setColor(0x00ff99)
        .addFields(
          {
            name: "🌡️ Temperatur",
            value: `${data.temperatureC?.toFixed(2) ?? "n/A"} °C`,
            inline: true,
          },
          {
            name: "💧 Luftfeuchtigkeit",
            value: `${data.humidityRh?.toFixed(2) ?? "n/A"} %`,
            inline: true,
          },
          {
            name: "🌫️ CO₂",
            value: `${data.co2?.toFixed(2) ?? "n/A"} ppm`,
            inline: true,
          },
          {
            name: "📈 VPD",
            value: `${data.vpd?.toFixed(2) ?? "n/A"}`,
            inline: true,
          }
        )
        .setTimestamp(new Date(data.createdAt + "Z"))
        .setFooter({ text: "Pulse Grow Pro" });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Pulse API Fehler:", error);
      await interaction.reply({
        content: "❌ Beim Abrufen der Sensordaten ist ein Fehler aufgetreten.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
