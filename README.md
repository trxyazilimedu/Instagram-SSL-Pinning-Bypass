# About Instagram & Facebook SSL Pinning Bypass Research
Don't forget to leave a ⭐, it's free!
### If you have found this project helpful, please support it with a commit or donation
tron(TRC20): `TEWyQAkozAu8JjFpEWWJNQidf8XGBVigM3`

## How to use

### Method 1: Frida Scripts (Requires Root) - Instagram Only
To use these scripts, you need frida-tools and frida-server running on your rooted device. If you are not familiar with Frida, please refer to the [official documentation](https://frida.re/docs/home/).

Example usage:
```bash
frida -U -l .\instagram-v404.js -f com.instagram.android 
```

### Method 2: Pre-patched APK (Non-Rooted Devices)

#### Instagram
For non-rooted devices, use the pre-patched APK available in the releases section. This APK has SSL pinning already disabled and works without requiring root access or Frida.

**Download:** [instagram-V405.apk](https://github.com/trxyazilimedu/Instagram-SSL-Pinning-Bypass/releases/tag/V405.1.0.57.77) (Version 405.1.0.57.77)

#### Facebook (Library Replacement Method)
For Facebook v540.0.0.49.148, use the patched `libcoldstart.so` library replacement method. This method does not use Frida.

**Download:** [libcoldstart.so](https://github.com/trxyazilimedu/Instagram-SSL-Pinning-Bypass/releases/tag/facebook-v540) (Version 540.0.0.49.148)

**Setup Steps:**
1. Install Facebook app (v540.0.0.49.148) on your device
2. Launch the app **once** and then close it completely
3. Push the patched library using ADB:
```bash
   adb push libcoldstart.so /data/data/com.facebook.katana/lib-compressed/
```
4. Restart the Facebook app
5. Configure your proxy tool (Burp Suite recommended)

> ⚠️ **Note:** The app must be launched at least once before pushing the patched library. This ensures the application's data directory structure is created properly.

## Recommended Setup
- **Proxy Tool:** [Burp Suite](https://portswigger.net/burp) - Industry-standard tool for intercepting and analyzing HTTPS traffic
- **Android Emulator:** [MEmu Play](https://www.memuplay.com/) - Lightweight emulator that works well with proxy configurations and SSL interception
- **ADB Tools:** Required for Facebook library replacement method

### Setup Steps:
1. Install MEmu emulator (or use a rooted physical device for Instagram Frida method)
2. Configure Burp Suite proxy (default: 127.0.0.1:8080)
3. Install Burp's CA certificate on the device
4. Configure device WiFi settings to use Burp proxy
5. **For Instagram:** Install the patched APK or use Frida with the appropriate script
6. **For Facebook:** Follow the library replacement steps above (no Frida required)

## Tested versions

### Instagram
| Script/APK | Version | Root Required | Method |
|------------|---------|---------------|--------|
| instagram-v395.js | 395.0.0.42.82 | Yes | Frida |
| instagram-v398.js | 398.1.0.53.77 | Yes | Frida |
| instagram-v404.js | 404.0.0.48.76 | Yes | Frida |
| instagram-V405.apk | 405.1.0.57.77 | **No** | Pre-patched APK |
| instagram-V407.apk | 407.0.0.7.243 | **No** | Pre-patched APK |

### Facebook
| File | Version | Root Required | Method |
|------|---------|---------------|--------|
| libcoldstart.so | 540.0.0.49.148 | **No** | Library Replacement (ADB) |

## Troubleshooting

### Facebook Library Replacement Issues
- **Permission denied:** Ensure your device has USB debugging enabled and ADB has proper permissions
- **Directory not found:** Make sure you launched the Facebook app at least once before pushing the library
- **App crashes:** Verify you're using the exact Facebook version (540.0.0.49.148) that matches the patched library
- **Still seeing SSL errors:** Confirm your proxy's CA certificate is properly installed in the device's trusted certificates

### Instagram Issues
- **Frida script errors:** Ensure frida-server version matches your frida-tools version
- **Patched APK not working:** Clear app data and cache before testing

---

> ⚠️ **Legal Notice:** **For educational and research purposes only.** Use only on applications and devices you **own** or are **explicitly authorized** to test. Unauthorized interception of communications may violate laws including the Computer Fraud and Abuse Act (CFAA) and similar regulations in other jurisdictions. Always respect applicable laws, regulations, and Terms of Service. This tool is intended solely for security research and authorized penetration testing.

> 📚 **Educational Purpose:** This repository is designed for security researchers, developers, and students learning about mobile application security, SSL/TLS protocols, and network security testing methodologies.

## Contributing
Contributions are welcome! If you have tested these methods on different versions or have improvements, please submit a pull request.

## Support
If you encounter any issues, please open an issue on GitHub with:
- Device/emulator details
- App version
- Method used (Frida/Patched APK/Library replacement)
- Error messages or logs
