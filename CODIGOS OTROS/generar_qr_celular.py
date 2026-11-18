import json
import os
import socket
import qrcode

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

ip = get_local_ip()
url = f"http://{ip}:5173/"

script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.abspath(os.path.join(script_dir, ".."))
brand_dir = os.path.join(base_dir, "PAGINA WEB", "public", "images", "brand")
public_dir = os.path.join(base_dir, "PAGINA WEB", "public")
os.makedirs(brand_dir, exist_ok=True)

# 1. Save QR image for web modal
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=10,
    border=2,
)
qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(fill_color="#0A192F", back_color="#FCFBF9")
img.save(os.path.join(brand_dir, "qr-celular.png"))

# 2. Save LAN info JSON
with open(os.path.join(public_dir, "lan-info.json"), "w", encoding="utf-8") as f:
    json.dump({"ip": ip, "url": url}, f, indent=2)

# 3. Print ASCII QR in terminal
print("\n" + "=" * 62)
print(f"  ESCANEA ESTE QR CON TU CELULAR (MISMA RED WI-FI):")
print(f"  Enlace Móvil Directo: {url}")
print("=" * 62)
qr.print_ascii(invert=True)
print("=" * 62 + "\n")

