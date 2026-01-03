import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, AlertCircle, Volume2 } from 'lucide-react';
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { Capacitor } from '@capacitor/core';

const VoiceCommandButton = ({ onCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [statusText, setStatusText] = useState('点击开始说话');
    const [hasPermission, setHasPermission] = useState(false);

    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        // The SpeechRecognition.available() check is removed as per instruction.
        // Permission checks are now handled directly in startListening.
    }, [isNative]);

    const startListening = async () => {
        setError(null);
        setStatusText('正在启动...');

        try {
            if (isNative) {
                // Native Implementation
                try {
                    const status = await SpeechRecognition.checkPermissions();
                    if (status.speechRecognition !== 'granted') {
                        await SpeechRecognition.requestPermissions();
                    }
                } catch (permError) {
                    console.warn("Permission check failed, trying to start anyway:", permError);
                    // On some devices/versions, straight to start() works if manifest is correct
                }

                setIsListening(true);
                setStatusText('🎙️ 正在聆听...');

                // Native plugin handles the UI/Mic internally usually on Android
                // But we can show our UI too.
                const { matches } = await SpeechRecognition.start({
                    language: "zh-CN",
                    maxResults: 1,
                    prompt: "请说出指令...", // Android only
                    popup: true, // Android only: shows native popup. User wanted "click mic -> speak".
                    // If "popup: false", we handle UI. If true, Google's dialogn shows.
                    // User said "program interface doesn't show keyboard", imply maybe native UI is OK?
                    // "user just clicks mic in program to speak".
                    // Let's try popup:false for seamless feel if possible, but popup:true is safer.
                    // Re-reading user: "click mic, background opens keyboard, auto hold..." -> logic: he wants system voice input.
                    // The native plugin effectively DOES this by calling SpeechRecognizer.
                    // Let's use standard native behavior.
                });

                if (matches && matches.length > 0) {
                    const text = matches[0];
                    setStatusText('✅ 识别成功');
                    onCommand(text);
                }

                setIsListening(false);
                setStatusText('点击开始说话');

            } else {
                // Web Fallback (for dev on PC)
                const SpeechRecognitionWeb = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognitionWeb) {
                    setError('浏览器不支持');
                    return;
                }
                const recognition = new SpeechRecognitionWeb();
                recognition.lang = 'zh-CN';
                recognition.onstart = () => {
                    setIsListening(true);
                    setStatusText('🎙️ 正在聆听 (Web)...');
                };
                recognition.onend = () => setIsListening(false);
                recognition.onresult = (e) => onCommand(e.results[0][0].transcript);
                recognition.start();
            }
        } catch (e) {
            console.error(e);
            setIsListening(false);
            setError(e.message || '识别失败');
            setStatusText('点击重试');
        }
    };

    const stopListening = async () => {
        try {
            if (isNative) {
                await SpeechRecognition.stop();
            }
            setIsListening(false);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleListen = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div style={{ textAlign: 'center', margin: 'var(--spacing-xl) 0' }}>
            <button
                onClick={toggleListen}
                style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: isListening
                        ? 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)'
                        : 'linear-gradient(135deg, #6C63FF 0%, #00D9FF 100%)',
                    color: 'white',
                    border: 'none',
                    boxShadow: isListening
                        ? '0 0 0 20px rgba(255, 107, 157, 0.15), 0 0 40px rgba(255, 107, 157, 0.3)'
                        : '0 10px 40px rgba(108, 99, 255, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isListening ? 'scale(1.1)' : 'scale(1)'
                }}
            >
                {isListening ? <Volume2 size={40} /> : <Mic size={40} />}
            </button>

            <p style={{
                marginTop: 'var(--spacing-md)',
                color: error ? 'var(--color-danger)' : (isListening ? 'var(--color-accent)' : 'var(--color-text-secondary)'),
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                minHeight: '24px'
            }}>
                {error ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <AlertCircle size={16} /> {error}
                    </span>
                ) : statusText}
            </p>

            {isListening && (
                <div style={{
                    marginTop: 'var(--spacing-sm)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '6px'
                }}>
                    {[0, 1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            style={{
                                width: '4px',
                                height: '20px',
                                borderRadius: '2px',
                                background: 'var(--color-accent)',
                                animation: `soundwave 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                                transformOrigin: 'bottom'
                            }}
                        />
                    ))}
                </div>
            )}
            <style>{`@keyframes soundwave { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>
        </div>
    );
};

VoiceCommandButton.Icon = Mic;

export default VoiceCommandButton;
