import QRCode from "qrcode";

export async function qrisPayloadToDataUrl(payload: string) {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 720,
    color: {
      dark: "#05070b",
      light: "#ffffff",
    },
  });
}
