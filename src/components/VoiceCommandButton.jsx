import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

const VoiceCommandButton = ({ onCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            setError('此设备不支持语音识别');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'zh-CN';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice result:', transcript);
            if (onCommand) {
                onCommand(transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);

            switch (event.error) {
                case 'not-allowed':
                case 'permission-denied':
                    setError('麦克风权限被拒绝，请在设置中开启');
                    break;
                case 'no-speech':
                    setError('没有检测到语音，请再试一次');
                    break;
                case 'network':
                    setError('网络错误，请检查网络连接');
                    break;
                case 'aborted':
                    // User aborted, no error message needed
                    break;
                default:
                    setError(`识别失败: ${event.error}`);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [onCommand]);

    const toggleListen = async () => {
        if (!isSupported) {
            setError('此设备不支持语音识别');
            return;
        }

        setError(null);

        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }

        // Try to start recognition directly
        // The browser/WebView will handle permission prompts
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error('Failed to start recognition:', e);
                if (e.message?.includes('already started')) {
                    // Already running, try to stop and restart
                    recognitionRef.current.stop();
                } else {
                    setError('启动语音识别失败，请重试');
                }
            }
        }
    };

    return (
        <div style={{ textAlign: 'center', margin: 'var(--spacing-xl) 0' }}>
            <button
                onClick={toggleListen}
                disabled={!isSupported}
                style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: isListening
                        ? 'var(--gradient-accent)'
                        : 'var(--gradient-primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: isListening
                        ? '0 0 0 15px rgba(255, 107, 157, 0.2), 0 0 30px rgba(255, 107, 157, 0.3)'
                        : '0 8px 30px rgba(108, 99, 255, 0.4)',
                    cursor: isSupported ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isListening ? 'scale(1.1)' : 'scale(1)',
                    opacity: isSupported ? 1 : 0.5
                }}
            >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
            </button>

            <p style={{
                marginTop: 'var(--spacing-md)',
                color: error ? 'var(--color-danger)' : (isListening ? 'var(--color-accent)' : 'var(--color-text-muted)'),
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
            }}>
                {error && <AlertCircle size={16} />}
                {error ? error : (isListening ? '🎙️ 正在聆听...' : '点击开始说话')}
            </p>

            {isListening && (
                <div style={{
                    marginTop: 'var(--spacing-sm)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '4px'
                }}>
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--color-accent)',
                                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default VoiceCommandButton;
