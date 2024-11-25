import dotenv from "dotenv";
dotenv.config();
import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";
import client from "./wa.js";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let sessionRunning = false;
let model = null;
let chat = null;
let activeUsers = [];

client.on("message", async (msg) => {
    console.log(`${msg.from} sent: ${msg.body}`);
    if (msg.body == "!ping") {
        msg.reply("pong");
    }
    if (msg.body.startsWith("!echo ")) {
        // Replies with the same message
        msg.reply(msg.body.slice(6));
    }
    if (msg.body === "!mediainfo" && msg.hasMedia) {
        const attachmentData = await msg.downloadMedia();
        msg.reply(`
            *Media info*
            MimeType: ${attachmentData.mimetype}
            Filename: ${attachmentData.filename}
            Data (length): ${attachmentData.data.length}
        `);
    }

    if (msg.body === "!init") {
        await run(msg); // init
        msg.reply("chatbot initialized!");
    }

    if (msg.body === "!stop") {
        sessionRunning = false; // stop
        if (activeUsers.includes(msg.from)) {
            const index = activeUsers.indexOf(msg.from);
            if (index > -1) {
                activeUsers.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
        msg.reply("chatbot stopped!");
    }

    if (msg.body !== "!init" && msg.body !== "!stop" && sessionRunning) {
        if (chat && activeUsers.includes(msg.from)) {
            const result = await chat.sendMessage(msg.body);
            const response = await result.response;
            const text = await response.text();
            msg.reply(text);
        }
    }
});

async function run(msg = null) {
    model = genAI.getGenerativeModel({ model: "gemini-pro" });

    chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [
                    {
                        text: `Kamu adalah customer service sebuah program beasiswa dari President University bernama program Beasiswa Industri 5.0 dalam bidang Digital, Inovasi, dan Kewirausahaan dengan nama Rama. Tugas kamu adalah menjawab pertanyaan terkait mata kuliah yang disediakan President University. 
                        President University memiliki 5 fakultas, yaitu: 1. Fakultas Ilmu Komputer (Faculty of Computer Science) 2. Fakultas Teknik (Faculty of Engineering) 3. Fakultas Bisnis (Faculty of Business) 4. Fakultas Humaniora (Faculty of Humanities) 5. Fakultas Hukum (Faculty of Law) 6. Fakultas Kedokteran (Faculty of Medicine).
                        Fakultas Ilmu Komputer memiliki jurusan Teknologi Informasi / Informatika (Information Technology / Informatics), Sistem Informasi (Information System), Desain Komunikasi Visual (Visual Communication Design), Desain Interior (Interior Design).
                        Fakultas Teknik memiliki jurusan Teknik Sipil (Civil Engineering), Teknik Elektro (Electrical Engineering), Teknik Lingkungan (Environmental Engineering), Teknik Industri (Industrial Engineering), Arsitektur (Architecture), Teknik Mesin (Mechanical Engineering).
                        Fakultas Bisni memiliki jurusan Akuntansi (Accounting), Ilmu Aktuaria (Actuarial Science), Administrasi Bisnis (Business Administration), Manajemen (Management), Agribisnis (Agribusiness).
                        Fakultas Humaniora memiliki jurusan Ilmu Komunikasi (Communications), Hubungan Internasional (International Relations), Pendidikan Guru Sekolah Dasar (Primary School Teacher Education).
                        Fakultas Hukum memiliki jurusan Hukum (Law).
                        Fakultas Kedokteran memiliki jurusan Kedokteran (Medicine), Profesi Dokter (Medical Doctor Profession).
                        Kamu hanya menjawab dalam 4 kalimat saja dengan bahasa Indonesia yang sopan dan ramah tanpa emoticon.
                        Selalu panggil dengan "Kak"/ "Kakak" dan hindari memanggil dengan sebutan "Anda".
                        Jawab hanya yang kamu tahu saja. Arahkan mereka untuk kontak ke academic@president.ac.id jika terdapat kendala.
                        Sesuaikan mata kuliah dengan jurusan yang disediakan oleh President University.
                        Kamu juga dapat memberikan rekomendasi mata kuliah dari data yang kamu punya jika mereka menanyakan rekomendasi yang diambil. Tanyakan dulu mengenai kenginan profesi dia, dan jumlah maksimal mata kuliah yang bisa diambil. Kemudian cocokkan dengan data yang kamu punya. Rekomendasikan setidaknya 3 mata kuliah.`,
                    },
                ],
            },
        ],
        generationConfig: {
            maxOutputTokens: 200,
        },
    });

    if (msg) {
        activeUsers.push(msg.from);
    }

    sessionRunning = true;
}
