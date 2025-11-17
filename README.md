# About Instagram SSL Pinning Bypass Research
Don't forget to leave a ⭐, it's free!

### If you have found this project helpful, please support it with a commit or donation
tron(TRC20): `TEWyQAkozAu8JjFpEWWJNQidf8XGBVigM3`

## How to use

### Method 1: Frida Scripts (Requires Root)
To use these scripts, you need frida-tools and frida-server running on your rooted device. If you are not familiar with Frida, please refer to the [official documentation](https://frida.re/docs/home/).

Example usage:
```bash
frida -U -l .\instagram-v404.js -f com.instagram.android --no-pause
```

### Method 2: Pre-patched APK (Non-Rooted Devices)
For non-rooted devices, use the pre-patched APK available in the releases section. This APK has SSL pinning already disabled and works without requiring root access or Frida.

**Download:** [instagram-V405.apk](https://github.com/trxyazilimedu/Instagram-SSL-Pinning-Bypass/releases/tag/V405.1.0.57.77) (Version 405.1.0.57.77)

## Recommended Setup
- **Proxy Tool:** [Burp Suite](https://portswigger.net/burp) - Industry-standard tool for intercepting and analyzing HTTPS traffic
- **Android Emulator:** [MEmu Play](https://www.memuplay.com/) - Lightweight emulator that works well with proxy configurations and SSL interception

### Setup Steps:
1. Install MEmu emulator
2. Configure Burp Suite proxy (default: 127.0.0.1:8080)
3. Install Burp's CA certificate on MEmu
4. Configure MEmu's WiFi settings to use Burp proxy
5. Install either the patched APK or use Frida with the appropriate script

## Tested versions
| Script/APK | Version | Root Required |
|------------|---------|---------------|
| instagram-v395.js | 395.0.0.42.82 | Yes |
| instagram-v398.js | 398.1.0.53.77 | Yes |
| instagram-v404.js | 404.0.0.48.76 | Yes |
| instagram-V405.apk | 405.1.0.57.77 | **No (Pre-patched)** |

---

> ⚠️ **Legal Notice:** **For educational and research purposes only.** Use only on applications and devices you **own** or are **explicitly authorized** to test. Unauthorized interception of communications may violate laws including the Computer Fraud and Abuse Act (CFAA) and similar regulations in other jurisdictions. Always respect applicable laws, regulations, and Terms of Service. This tool is intended solely for security research and authorized penetration testing.

> 📚 **Educational Purpose:** This repository is designed for security researchers, developers, and students learning about mobile application security, SSL/TLS protocols, and network security testing methodologies.
