'use strict';
var isTigonMNSServiceHolderHooked = false;
let Log = null;
const messageBuffer = [];

function lg(tag, msg) {
    try { 
        msg = (msg || '').toString();
        msg = msg.normalize('NFC');
    } catch(e) { msg = String(msg); }

    if (Log) {
        try { Log.i(tag, msg); } catch (e) {}
        try { send({ tag: tag, msg: msg }); } catch (e) {}
        try { console.log(tag + ' : ' + msg); } catch (e) {}
        return;
    }

    try { messageBuffer.push({ tag: tag, msg: msg }); } catch (e) {}
    try { send({ tag: tag, msg: msg }); } catch (e) {}
    try { console.log(tag + ' : ' + msg); } catch (e) {}
}

Java.perform(function () {
    try {
        Log = Java.use('android.util.Log');
        try {
            for (let i = 0; i < messageBuffer.length; i++) {
                const it = messageBuffer[i];
                try { Log.i(it.tag, it.msg); } catch (e) {}
            }
            messageBuffer.length = 0;
        } catch (e) {}
    } catch (e) {
        Log = null;
    }
});
function waitForClass(className, onFound, opts) {
    opts = opts || {};
    const interval = opts.interval || 200; // ms
    const timeout = (typeof opts.timeout === 'number') ? opts.timeout : 30000; // ms
    const onTimeout = typeof opts.onTimeout === 'function' ? opts.onTimeout : function() {
        lg('YB_DIAG', '[*][-] waitForClass timeout: ' + className + ' yüklenmedi (timeout ' + timeout + 'ms).');
    };

    let elapsed = 0;
    const handle = setInterval(function() {
        try {
            Java.perform(function () {
                try {
                    const Cls = Java.use(className);
                    clearInterval(handle);
                    lg('YB_DIAG', '[*][+] waitForClass: ' + className + ' bulundu' + (opts.tag ? ' ('+opts.tag+')' : ''));
                    try {
                        onFound(Cls);
                    } catch (e) {
                        lg('YB_DIAG', '[*][-] waitForClass onFound callback hata: ' + e);
                    }
                } catch (e) {
                    // sınıf henüz yok - sessiz devam
                }
            });
        } catch (outerErr) {
            try { lg('YB_DIAG', '[*][-] waitForClass Java.perform hata: ' + outerErr); } catch(e){}
        }

        elapsed += interval;
        if (timeout > 0 && elapsed >= timeout) {
            clearInterval(handle);
            onTimeout();
        }
    }, interval);
}

function hookLibLoading() {
    Java.perform(() => {
		lg("TRX:","start HookLib")
           if (!isTigonMNSServiceHolderHooked) {
				lg("TRX:","Hooked")
                isTigonMNSServiceHolderHooked = true;
                hookTigonMNSServiceHolder();
                hookVerifyWithProofOfPossession();
            }
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
                        lg("TRX:",'[*][+] setEnableCertificateVerificationWithProofOfPossession(false) çağrıldı');
                    } catch (e) {
                         lg("TRX:",'[*][-] setEnableCertificateVerificationWithProofOfPossession bulunamadı: ' + e);
                    }
                } catch (e) {
                     lg("TRX:",'[*][-] cfg patch failed: ' + e);
                }
                return this.initHybrid(cfg, str1, hucClient, boolVal, provider, str2);
            };
        });
         lg("TRX:",'[*][+] Hooked TigonMNSServiceHolder.initHybrid (correct signature)');
    } catch (e) {
         lg("TRX:",'[*][-] Failed to hook TigonMNSServiceHolder.initHybrid: ' + e);
    }
}

function hookVerifyWithProofOfPossession() {
    try {
        Java.perform(() => {
            const TigonMNSConfig = Java.use('com.facebook.tigon.tigonmns.TigonMNSConfig');

            try {
                if (TigonMNSConfig.getEnableCertificateVerificationWithProofOfPossession) {
                    TigonMNSConfig.getEnableCertificateVerificationWithProofOfPossession.implementation = function () {
                         lg("TRX:",'[*][+] getEnableCertificateVerificationWithProofOfPossession called - return false');
                        return false;
                    };
                     lg("TRX:",'[*][+] Hooked getEnableCertificateVerificationWithProofOfPossession');
                }
            } catch (e) {
                 lg("TRX:",'[*][-] Failed to hook getEnableCertificateVerificationWithProofOfPossession: ' + e);
            }

            try {
                if (TigonMNSConfig.verifyWithProofOfPossession) {
                    TigonMNSConfig.verifyWithProofOfPossession.implementation = function () {
                         lg("TRX:",'[*][+] verifyWithProofOfPossession called - bypassed');
                        return true;
                    };
                     lg("TRX:",'[*][+] Hooked verifyWithProofOfPossession');
                }
            } catch (e) {
                 lg("TRX:",'[*][-] verifyWithProofOfPossession not found (normal)');
            }

            try {
                if (TigonMNSConfig.getTrustSandboxCertificates) {
                    TigonMNSConfig.getTrustSandboxCertificates.implementation = function () {
                         lg("TRX:",'[*][+] getTrustSandboxCertificates called - return true');
                        return true;
                    };
                     lg("TRX:",'[*][+] Hooked getTrustSandboxCertificates');
                }
            } catch (e) {
                 lg("TRX:",'[*][-] Failed to hook getTrustSandboxCertificates: ' + e);
            }
        });
    } catch (e) {
         lg("TRX:",'[*][-] Failed to hook verification methods: ' + e);
    }
}

Java.perform(function () {
	   waitForClass('com.facebook.tigon.tigonmns.TigonMNSServiceHolder', function(TigonMNSServiceHolder) {
		   hookLibLoading();
        });
    try {
        const array_list = Java.use('java.util.ArrayList');
        const TrustImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        if (TrustImpl.checkTrustedRecursive) {
             lg("TRX:",'[*][+] Hooked checkTrustedRecursive');
            TrustImpl.checkTrustedRecursive.implementation = function (a1, a2, a3, a4, a5, a6) {
                return array_list.$new();
            };
        } else {
             lg("TRX:",'[*][-] checkTrustedRecursive not Found');
        }
    } catch (e) {
         lg("TRX:",'[*][-] Failed to hook checkTrustedRecursive: ' + e);
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
						   hookLibLoading();
                     lg("TRX:",'[*] checkServerTrusted bypassed');
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
             lg("TRX:",'[*] SSLContext.init called. Replacing TrustManager...');
        };
         lg("TRX:",'[*][+] Hooked SSLContext.init');
    } catch (e) {
         lg("TRX:",'[*][-] Failed to hook SSLContext.init: ' + e);
    }
});
