'use strict';

var isTigonMNSServiceHolderHooked = false;

function logger(msg) {
    console.log(msg);
}

function hookLibLoading() {
    Java.perform(() => {
        const systemClass = Java.use('com.facebook.soloader.MergedSoMapping$Invoke_JNI_OnLoad');
        systemClass.libappstatelogger2_so.implementation = function () {
            if (!isTigonMNSServiceHolderHooked) {
                isTigonMNSServiceHolderHooked = true;
                hookTigonMNSServiceHolder();
                hookVerifyWithProofOfPossession();
            }
            return this.libappstatelogger2_so();
        };
    });
}

function hookTigonMNSServiceHolder() {
    try {
        Java.perform(() => {
            const TigonMNSServiceHolder = Java.use('com.facebook.tigon.tigonmns.TigonMNSServiceHolder');


            TigonMNSServiceHolder.initHybrid.overload(
                'com.facebook.tigon.tigonmns.TigonMNSConfig',
                'java.lang.String',
                'com.facebook.tigon.tigonhuc.HucClient',
                'boolean',
                'com.facebook.tigon.iface.TigonServiceHolderProvider',
                'java.lang.String'
            ).implementation = function (cfg, str1, hucClient, boolVal, provider, str2) {
                try {
                    cfg.setTrustSandboxCertificates(true);
                    cfg.setForceHttp2(true);
                    try {
                        cfg.setEnableCertificateVerificationWithProofOfPossession(false);
                        logger('[*][+] setEnableCertificateVerificationWithProofOfPossession(false) çağrıldı');
                    } catch (e) {
                        logger('[*][-] setEnableCertificateVerificationWithProofOfPossession bulunamadı: ' + e);
                    }
                } catch (e) {
                    logger('[*][-] cfg patch failed: ' + e);
                }
                return this.initHybrid(cfg, str1, hucClient, boolVal, provider, str2);
            };
        });
        logger('[*][+] Hooked TigonMNSServiceHolder.initHybrid (correct signature)');
    } catch (e) {
        logger('[*][-] Failed to hook TigonMNSServiceHolder.initHybrid: ' + e);
    }
}

function hookVerifyWithProofOfPossession() {
    try {
        Java.perform(() => {
            const TigonMNSConfig = Java.use('com.facebook.tigon.tigonmns.TigonMNSConfig');

            try {
                if (TigonMNSConfig.getEnableCertificateVerificationWithProofOfPossession) {
                    TigonMNSConfig.getEnableCertificateVerificationWithProofOfPossession.implementation = function () {
                        logger('[*][+] getEnableCertificateVerificationWithProofOfPossession called - return false');
                        return false;
                    };
                    logger('[*][+] Hooked getEnableCertificateVerificationWithProofOfPossession');
                }
            } catch (e) {
                logger('[*][-] Failed to hook getEnableCertificateVerificationWithProofOfPossession: ' + e);
            }

            try {
                if (TigonMNSConfig.verifyWithProofOfPossession) {
                    TigonMNSConfig.verifyWithProofOfPossession.implementation = function () {
                        logger('[*][+] verifyWithProofOfPossession called - bypassed');
                        return true;
                    };
                    logger('[*][+] Hooked verifyWithProofOfPossession');
                }
            } catch (e) {
                logger('[*][-] verifyWithProofOfPossession not found (normal)');
            }

            try {
                if (TigonMNSConfig.getTrustSandboxCertificates) {
                    TigonMNSConfig.getTrustSandboxCertificates.implementation = function () {
                        logger('[*][+] getTrustSandboxCertificates called - return true');
                        return true;
                    };
                    logger('[*][+] Hooked getTrustSandboxCertificates');
                }
            } catch (e) {
                logger('[*][-] Failed to hook getTrustSandboxCertificates: ' + e);
            }
        });
    } catch (e) {
        logger('[*][-] Failed to hook verification methods: ' + e);
    }
}

hookLibLoading();

// ✅ Universal Android SSL Pinning Bypass
Java.perform(function () {
    try {
        const array_list = Java.use('java.util.ArrayList');
        const TrustImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        if (TrustImpl.checkTrustedRecursive) {
            logger('[*][+] Hooked checkTrustedRecursive');
            TrustImpl.checkTrustedRecursive.implementation = function (a1, a2, a3, a4, a5, a6) {
                return array_list.$new();
            };
        } else {
            logger('[*][-] checkTrustedRecursive not Found');
        }
    } catch (e) {
        logger('[*][-] Failed to hook checkTrustedRecursive: ' + e);
    }
});

Java.perform(function () {
    try {
        const X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        const SSLContext = Java.use('javax.net.ssl.SSLContext');
        const TrustManager = Java.registerClass({
            name: 'com.leftenter.instagram.simple',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted(chain, authType) {},
                checkServerTrusted(chain, authType) {
                    logger('[*] checkServerTrusted bypassed');
                },
                getAcceptedIssuers() {
                    return [];
                },
            },
        });
        const TrustManagers = [TrustManager.$new()];
        const SSLContextInit = SSLContext.init.overload(
            '[Ljavax.net.ssl.KeyManager;',
            '[Ljavax.net.ssl.TrustManager;',
            'java.security.SecureRandom'
        );
        SSLContextInit.implementation = function (keyManager, trustManager, secureRandom) {
            SSLContextInit.call(this, keyManager, TrustManagers, secureRandom);
            logger('[*] SSLContext.init called. Replacing TrustManager...');
        };
        logger('[*][+] Hooked SSLContext.init');
    } catch (e) {
        logger('[*][-] Failed to hook SSLContext.init: ' + e);
    }
});

logger('[*] Instagram SSL Pinning Bypass Script (v398) yüklendi');
