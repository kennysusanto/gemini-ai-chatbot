import ww from "whatsapp-web.js";
const { Client, LocalAuth } = ww;

import qrcode from "qrcode-terminal";

console.log("Client is initializing!");
const client = new Client({ authStrategy: new LocalAuth() });

client.on("qr", (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Client is ready!");
});

// client.on("message", async (msg) => {
//     if (msg.body == "!ping") {
//         msg.reply("pong");
//     }
//     if (msg.body.startsWith("!echo ")) {
//         // Replies with the same message
//         msg.reply(msg.body.slice(6));
//     }
//     if (msg.body === "!mediainfo" && msg.hasMedia) {
//         const attachmentData = await msg.downloadMedia();
//         msg.reply(`
//             *Media info*
//             MimeType: ${attachmentData.mimetype}
//             Filename: ${attachmentData.filename}
//             Data (length): ${attachmentData.data.length}
//         `);
//     }
// });

client.initialize();

export default client;
