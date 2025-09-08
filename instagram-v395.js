'use strict'

var isTigonMNSServiceHolderHooked = false;

function hookLibLoading(){
    Java.perform(() => {
        var systemClass = Java.use("com.facebook.soloader.MergedSoMapping$Invoke_JNI_OnLoad");
        systemClass.libappstatelogger2_so.implementation = function(){
            if(isTigonMNSServiceHolderHooked == false){
                isTigonMNSServiceHolderHooked = true;
                hookTigonMNSServiceHolder();
                hookVerifyWithProofOfPossession();
            }
            var ret = this.libappstatelogger2_so();
            return ret;
        }
    });
}

function hookTigonMNSServiceHolder(){
    try {
        Java.perform(() => {
            const TigonMNSServiceHolder = Java.use("com.facebook.tigon.tigonmns.TigonMNSServiceHolder");
            TigonMNSServiceHolder.initHybrid.overload(
                "com.facebook.tigon.tigonmns.TigonMNSConfig",
                "java.lang.String",
                "com.facebook.tigon.tigonhuc.HucClient",
                "com.facebook.tigon.iface.TigonServiceHolder",
                "java.lang.String",
                "boolean"
            ).implementation = function(cfg, str1, hucClient, serviceHolder, str2, boolVal) {
                try {
                    cfg.setTrustSandboxCertificates(true);
                    cfg.setForceHttp2(true);
                    // Sadece bilinen metodu çağır
                    try {
                        cfg.setEnableCertificateVerificationWithProofOfPossession(false);
                        logger("[*][+] setEnableCertificateVerificationWithProofOfPossession(false) başarıyla çağrıldı");
                    } catch (e) {
                        logger("[*][-] setEnableCertificateVerificationWithProofOfPossession bulunamadı: " + e);
                    }
                } catch (e) {
                    logger("[*][-] cfg patch failed: " + e);
                }
                return this.initHybrid(cfg, str1, hucClient, serviceHolder, str2, boolVal);
            };
        });
        logger("[*][+] Hooked TigonMNSServiceHolder.initHybrid (6 args)");
    } catch (e) {
        logger("[*][-] Failed to hook TigonMNSServiceHolder.initHybrid: " + e);
    }
}

function hookVerifyWithProofOfPossession() {
    try {
        Java.perform(() => {
            var TigonMNSConfigClass = Java.use("com.facebook.tigon.tigonmns.TigonMNSConfig");
            
            // Sadece bilinen metodları hook et - hatasız
            try {
                if (TigonMNSConfigClass.getEnableCertificateVerificationWithProofOfPossession) {
                    TigonMNSConfigClass.getEnableCertificateVerificationWithProofOfPossession.implementation = function() {
                        logger("[*][+] getEnableCertificateVerificationWithProofOfPossession called - return false");
                        return false; // Sertifika doğrulamayı devre dışı bırak
                    };
                    logger("[*][+] Hooked getEnableCertificateVerificationWithProofOfPossession");
                }
            } catch (e) {
                logger("[*][-] Failed to hook getEnableCertificateVerificationWithProofOfPossession: " + e);
            }

            // Eski metodları da dene
            try {
                if (TigonMNSConfigClass.verifyWithProofOfPossession) {
                    TigonMNSConfigClass.verifyWithProofOfPossession.implementation = function() {
                        logger("[*][+] verifyWithProofOfPossession called - bypassed");
                        return true;
                    };
                    logger("[*][+] Hooked verifyWithProofOfPossession");
                }
            } catch (e) {
                logger("[*][-] verifyWithProofOfPossession not found (normal)");
            }

            // Trust sandbox certificates
            try {
                if (TigonMNSConfigClass.getTrustSandboxCertificates) {
                    TigonMNSConfigClass.getTrustSandboxCertificates.implementation = function() {
                        logger("[*][+] getTrustSandboxCertificates called - return true");
                        return true;
                    };
                    logger("[*][+] Hooked getTrustSandboxCertificates");
                }
            } catch (e) {
                logger("[*][-] Failed to hook getTrustSandboxCertificates: " + e);
            }
        });
    } catch(e) {
        logger("[*][-] Failed to hook verification methods: " + e);
    }
}

function logger(message) {
    console.log(message);
}

hookLibLoading();

//Universal Android SSL Pinning Bypass
Java.perform(function() {
    try {
        var array_list = Java.use("java.util.ArrayList");
        var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        if (ApiClient.checkTrustedRecursive) {
            logger("[*][+] Hooked checkTrustedRecursive")
            ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
                var k = array_list.$new();
                return k;
            }
        } else {
            logger("[*][-] checkTrustedRecursive not Found")
        }
    } catch (e) {
        logger("[*][-] Failed to hook checkTrustedRecursive: " + e)
    }
});

Java.perform(function() {
    try {
        const x509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
        const sSLContext = Java.use("javax.net.ssl.SSLContext");
        const TrustManager = Java.registerClass({
            implements: [x509TrustManager],
            methods: {
                checkClientTrusted(chain, authType) {},
                checkServerTrusted(chain, authType) {
                    logger("[*] checkServerTrusted bypassed");
                },
                getAcceptedIssuers() {
                    return [];
                },
            },
            name: "com.leftenter.instagram.simple",
        });
        const TrustManagers = [TrustManager.$new()];
        const SSLContextInit = sSLContext.init.overload(
            "[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom");
        SSLContextInit.implementation = function(keyManager, trustManager, secureRandom) {
            SSLContextInit.call(this, keyManager, TrustManagers, secureRandom);
            logger("[*] SSLContext.init called. Replacing TrustManager...");
        };
        logger("[*][+] Hooked SSLContext.init")
    } catch (e) {
        logger("[*][-] Failed to hook SSLContext.init: " + e)
    }
});

logger("[*] Instagram Simple SSL Pinning Bypass Script loaded - VerifyWithProofOfPossession focused");