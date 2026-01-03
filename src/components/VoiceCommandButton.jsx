import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, AlertCircle, Volume2, WifiOff } from 'lucide-react';

const VoiceCommandButton = ({ onCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(true);
    const [statusText, setStatusText] = useState('点击开始说话');
    const recognitionRef = useRef(null);
    const timeoutRef = useRef(null);

    const cleanup = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const initRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            setError('此设备不支持语音识别');
            return null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'zh-CN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            cleanup();
            setIsListening(true);
            setError(null);
            setStatusText('🎙️ 正在聆听...');
        };

        recognition.onend = () => {
            cleanup();
            setIsListening(false);
            setStatusText('点击开始说话');
        };

        recognition.onresult = (event) => {
            cleanup();
            const transcript = event.results[0][0].transcript;
            setStatusText('✅ 识别成功');
            if (onCommand) {
                onCommand(transcript);
            }
        };

        recognition.onerror = (event) => {
            cleanup();
            setIsListening(false);

            switch (event.error) {
                case 'not-allowed':
                case 'permission-denied':
                    setError('麦克风权限被拒绝');
                    setStatusText('请在系统设置中开启');
                    break;
                case 'no-speech':
                    setError(null);
                    setStatusText('没有检测到语音');
                    break;
                case 'network':
                    setError('需要网络连接');
                    setStatusText('语音识别需要联网');
                    break;
                case 'audio-capture':
                    setError('无法获取麦克风');
                    break;
                case 'service-not-allowed':
                    setError('语音服务不可用');
                    setStatusText('此设备不支持语音识别');
                    setIsSupported(false);
                    break;
                case 'aborted':
                    setStatusText('点击开始说话');
                    break;
                default:
                    setError(`错误: ${event.error}`);
            }
        };

        return recognition;
    }, [onCommand, cleanup]);

    useEffect(() => {
        recognitionRef.current = initRecognition();
        return () => {
            cleanup();
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (e) { }
            }
        };
    }, [initRecognition, cleanup]);

    const handleClick = () => {
        setError(null);

        if (!isSupported) {
            setError('此设备不支持语音识别');
            setStatusText('请使用支持语音的浏览器');
            return;
        }

        if (isListening) {
            cleanup();
            try { recognitionRef.current?.stop(); } catch (e) { }
            setIsListening(false);
            setStatusText('点击开始说话');
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = initRecognition();
        }

        if (recognitionRef.current) {
            setStatusText('正在启动...');

            // Set a timeout - if nothing happens in 3 seconds, show error
            timeoutRef.current = setTimeout(() => {
                if (!isListening) {
                    setError('启动超时');
                    setStatusText('语音服务可能不可用');
                    setIsListening(false);
                    try { recognitionRef.current?.abort(); } catch (e) { }
                }
            }, 3000);

            try {
                recognitionRef.current.start();
            } catch (e) {
                cleanup();
                if (e.message?.includes('already started')) {
                    try {
                        recognitionRef.current.stop();
                        setTimeout(() => {
                            try { recognitionRef.current?.start(); } catch (e2) { }
                        }, 100);
                    } catch (e2) { }
                } else {
                    setError('启动失败');
                    setStatusText('请检查麦克风权限');
                }
            }
        }
    };

    return (
        <div style={{ textAlign: 'center', margin: 'var(--spacing-xl) 0' }}>
            <button
                onClick={handleClick}
                style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: !isSupported
                        ? 'linear-gradient(135deg, #555 0%, #333 100%)'
                        : isListening
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
                {!isSupported ? <WifiOff size={40} /> : isListening ? <Volume2 size={40} /> : <Mic size={40} />}
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

            {/* Hint for Android users */}
            {!isSupported && (
                <p style={{
                    marginTop: 'var(--spacing-sm)',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-xs)',
                    maxWidth: '200px',
                    margin: '8px auto 0'
                }}>
                    💡 提示：部分安卓设备需要使用 Chrome 浏览器访问才能使用语音功能
                </p>
            )}

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

            <style>{`
                @keyframes soundwave {
                    from { transform: scaleY(0.3); }
                    to { transform: scaleY(1); }
                }
            `}</style>
        </div>
    );
};

VoiceCommandButton.Icon = Mic;

export default VoiceCommandButton;
