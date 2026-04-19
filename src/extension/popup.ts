import logoUrl from "@/assets/logo.png";
import qrcodeUrl from "@/assets/wechat-qrcode.png";

const logoEl = document.getElementById("logo") as HTMLImageElement | null;
if (logoEl) logoEl.src = logoUrl;

const qrEl = document.getElementById("qrcode") as HTMLImageElement | null;
if (qrEl) qrEl.src = qrcodeUrl;
