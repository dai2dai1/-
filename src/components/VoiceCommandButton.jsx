import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, AlertCircle, Volume2 } from 'lucide-react';

const VoiceCommandButton = ({ onCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(true);
    const [statusText, setStatusText] = useState('点击开始说话');
    const recognitionRef = useRef(null);
    const isInitializedRef = useRef(false);

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
            console.log('Speech recognition started');
            setIsListening(true);
            setError(null);
            setStatusText('🎙️ 正在聆听...');
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
            setStatusText('点击开始说话');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice result:', transcript);
            setStatusText('✅ 识别成功');
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
                    setError('麦克风权限被拒绝');
                    setStatusText('请在设置中开启麦克风权限');
                    break;
                case 'no-speech':
                    setError(null);
                    setStatusText('没有检测到语音，请再试');
                    break;
                case 'network':
                    setError('网络错误');
                    setStatusText('请检查网络连接');
                    break;
                case 'audio-capture':
                    setError('无法获取麦克风');
                    setStatusText('请检查麦克风设备');
                    break;
                case 'aborted':
                    setStatusText('点击开始说话');
                    break;
                default:
                    setError(`错误: ${event.error}`);
                    setStatusText('点击重试');
            }
        };

        recognition.onspeechstart = () => {
            console.log('Speech detected');
            setStatusText('🗣️ 检测到语音...');
        };

        recognition.onspeechend = () => {
            console.log('Speech ended');
            setStatusText('⏳ 正在识别...');
        };

        return recognition;
    }, [onCommand]);

    useEffect(() => {
        if (!isInitializedRef.current) {
            recognitionRef.current = initRecognition();
            isInitializedRef.current = true;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) { }
            }
        };
    }, [initRecognition]);

    const handleClick = () => {
        setError(null);

        if (!isSupported) {
            setError('此设备不支持语音识别');
            return;
        }

        if (isListening) {
            console.log('Stopping recognition...');
            try {
                recognitionRef.current?.stop();
            } catch (e) {
                console.error('Stop error:', e);
            }
            return;
        }

        // Re-initialize if needed
        if (!recognitionRef.current) {
            recognitionRef.current = initRecognition();
        }

        if (recognitionRef.current) {
            console.log('Starting recognition...');
            setStatusText('正在启动...');
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error('Start error:', e);
                if (e.message?.includes('already started')) {
                    try {
                        recognitionRef.current.stop();
                        setTimeout(() => {
                            recognitionRef.current?.start();
                        }, 100);
                    } catch (e2) {
                        setError('启动失败，请重试');
                        setStatusText('点击重试');
                    }
                } else {
                    setError('启动失败');
                    setStatusText('点击重试');
                }
            }
        }
    };

    return (
        <div style={{ textAlign: 'center', margin: 'var(--spacing-xl) 0' }}>
            <button
                onClick={handleClick}
                disabled={!isSupported}
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
                    cursor: isSupported ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isListening ? 'scale(1.1)' : 'scale(1)',
                    opacity: isSupported ? 1 : 0.5
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

            <style>{`
                @keyframes soundwave {
                    from { transform: scaleY(0.3); }
                    to { transform: scaleY(1); }
                }
            `}</style>
        </div>
    );
};

export default VoiceCommandButton;
