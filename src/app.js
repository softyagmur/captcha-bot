const {
  Client,
  Partials,
  GatewayIntentBits,
  AttachmentBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { generateCaptchaText, generateCaptchaImage } = require("./lib/captcha");
const { lang, ownerID, captchaRoleID } = require("../config.json");
const { Database, writeLang } = require("rainstack");
const { config } = require("dotenv");
writeLang(lang);
config();

const client = new Client({
  intents: Object.values(GatewayIntentBits),
  partials: Object.values(Partials),
});
const db = new Database("database.json");

client.on("messageCreate", async (message) => {
  if (message.content === ".system") {
    if (message.member.id !== ownerID) return;
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("Doğrulama Noktası")
      .setDescription(
        "Sunucuya giriş yapmak için aşağıdaki 'doğrula' butonunu kullanınız."
      )
      .setFooter({ text: message.guild.name });

    const button = new ButtonBuilder()
      .setLabel("Doğrula")
      .setCustomId("dogrula")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.customId === "dogrula") {
    const code = generateCaptchaText();
    const imageBuffer = generateCaptchaImage(code);
    const attachment = new AttachmentBuilder(imageBuffer, {
      name: "captcha.png",
    });

    db.set(`${interaction.user.id}.captcha`, code);

    const button = new ButtonBuilder()
      .setLabel("Doğrula")
      .setCustomId("dogrula2")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    interaction.reply({ files: [attachment], components: [row], flags: 64 });
  }

  if (interaction.customId === "dogrula2") {
    const modal = new ModalBuilder()
      .setTitle("Captcha Doğrulaması")
      .setCustomId("captcha");

    const input1 = new TextInputBuilder()
      .setCustomId("input1")
      .setLabel("Captcha")
      .setMaxLength(5)
      .setMinLength(5)
      .setStyle(TextInputStyle.Short);

    const row = new ActionRowBuilder().addComponents(input1);

    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  if (interaction.customId === "captcha") {
    const input1 = interaction.fields.getTextInputValue("input1");

    const database = db.get(`${interaction.user.id}.captcha`);

    if (database === input1) {
      interaction.member.roles.add(captchaRoleID);

      return interaction.reply({
        content: "Sunucuya başarıyla giriş yaptınız!",
        flags: 64,
      });
    } else {
      return interaction.reply({
        content: "Lütfen geçerli captcha girin!",
        flags: 64,
      });
    }
  }
});

client.login(process.env.token);
