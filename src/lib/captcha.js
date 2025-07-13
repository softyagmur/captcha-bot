const { createCanvas } = require("canvas");

function generateCaptchaText(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function generateCaptchaImage(text) {
  const width = 250;
  const height = 100;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#2f3136";
  ctx.fillRect(0, 0, width, height);

  ctx.font = "bold 40px Sans";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 85%)`;

    const angle = (Math.random() - 0.5) * 0.6;

    const x = 30 + i * 40 + Math.random() * 10;
    const y = 50 + Math.random() * 20;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = "#" + Math.floor(Math.random() * 16777215).toString(16);
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = "#"+Math.floor(Math.random()*16777215).toString(16);
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillRect(x, y, 1, 1);
  }

  return canvas.toBuffer();
}

module.exports = { generateCaptchaText, generateCaptchaImage };
