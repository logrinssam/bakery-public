const crypto = require("crypto");
const cors = require("cors")({ origin: true });

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

if (!admin.apps.length) {
  admin.initializeApp();
}

function sha256Hex(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Delete a Hall of Fame record (teacher only).
 *
 * Request:
 *   POST { pin: string, recordId: string }
 *
 * Env:
 *   VISITOR_ADMIN_PIN_SHA256: sha256(pin)
 */
exports.deleteHallRecord = onRequest(
  { region: "asia-northeast3" },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        res.status(405).json({ ok: false, error: "method_not_allowed" });
        return;
      }

      const expected = String(process.env.VISITOR_ADMIN_PIN_SHA256 || "")
        .trim()
        .toLowerCase();
      if (!expected) {
        res.status(500).json({ ok: false, error: "pin_hash_not_configured" });
        return;
      }

      const pin = String(req.body?.pin || "").trim();
      const recordId = String(req.body?.recordId || "").trim();

      if (!/^\d{1,32}$/.test(pin)) {
        res.status(400).json({ ok: false, error: "invalid_pin" });
        return;
      }
      if (!recordId || recordId.length > 128) {
        res.status(400).json({ ok: false, error: "invalid_record_id" });
        return;
      }

      const actual = sha256Hex(pin);
      if (actual !== expected) {
        res.status(403).json({ ok: false, error: "forbidden" });
        return;
      }

      try {
        await admin.firestore().collection("hallRecords").doc(recordId).delete();
        res.json({ ok: true });
      } catch (e) {
        res.status(500).json({ ok: false, error: "delete_failed" });
      }
    });
  }
);

