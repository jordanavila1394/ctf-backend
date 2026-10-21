const nodemailer = require("nodemailer");

const gmailUser = process.env.GMAIL_USER || "cloudctf@ctfitalia.com";
// Preferire sempre env su Render; fallback = App Password Google (non la password account)
const gmailPass =
  process.env.GMAIL_APP_PASSWORD || "zsfn wzqe ziwv eubw";

/** Minimo ms tra un invio e il successivo (default 4s) */
const MIN_INTERVAL_MS = Number(process.env.EMAIL_MIN_INTERVAL_MS) || 4000;
/** Massimo invii SMTP in una finestra di 1 ora (default 40) */
const MAX_PER_HOUR = Number(process.env.EMAIL_MAX_PER_HOUR) || 40;

if (!process.env.GMAIL_APP_PASSWORD) {
  console.warn(
    "[mail] GMAIL_APP_PASSWORD non in env: uso fallback locale. Impostala su Render."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

let chain = Promise.resolve();
let lastSentAt = 0;
const sentTimestamps = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForSlot() {
  const now = Date.now();
  while (sentTimestamps.length && now - sentTimestamps[0] > 60 * 60 * 1000) {
    sentTimestamps.shift();
  }

  if (sentTimestamps.length >= MAX_PER_HOUR) {
    const waitMs = 60 * 60 * 1000 - (now - sentTimestamps[0]) + 250;
    console.warn(
      `[mail] Limite orario raggiunto (${MAX_PER_HOUR}/h). Attendo ${Math.ceil(
        waitMs / 1000
      )}s`
    );
    await sleep(waitMs);
    return waitForSlot();
  }

  if (lastSentAt) {
    const sinceLast = Date.now() - lastSentAt;
    if (sinceLast < MIN_INTERVAL_MS) {
      await sleep(MIN_INTERVAL_MS - sinceLast);
    }
  }
}

/**
 * Accoda un invio SMTP con throttle (intervallo minimo + max/ora).
 * @param {import("nodemailer").SendMailOptions} mailOptions
 */
function sendMailQueued(mailOptions) {
  const run = chain.then(async () => {
    await waitForSlot();

    const options = {
      ...mailOptions,
      // From allineato all'account autenticato evita spoofing / spam flags
      from:
        mailOptions.from ||
        `CTF Italia <${gmailUser}>`,
    };

    const info = await transporter.sendMail(options);
    lastSentAt = Date.now();
    sentTimestamps.push(lastSentAt);
    console.log(
      `[mail] Inviata (coda ${sentTimestamps.length}/${MAX_PER_HOUR} nell'ora)`
    );
    return info;
  });

  // Non bloccare la coda se un invio fallisce
  chain = run.catch((err) => {
    console.error("[mail] Errore in coda:", err.message);
  });

  return run;
}

function getMailUser() {
  return gmailUser;
}

module.exports = {
  transporter,
  sendMailQueued,
  getMailUser,
  MIN_INTERVAL_MS,
  MAX_PER_HOUR,
};
