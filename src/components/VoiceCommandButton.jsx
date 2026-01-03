import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames'; // Need to install this or remove dep
import { Mic, MicOff, Loader } from 'lucide-react'; // Need to install lucide-react

const VoiceCommandButton = ({ onCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // Stop after one sentence
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
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setError('请允许麦克风权限');
                } else {
                    setError('无法识别，请重试');
                }
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            setError('浏览器不支持语音功能');
        }
    }, [onCommand]);

    const toggleListen = async () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            // Request microphone permission explicitly
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (permError) {
                console.error('Microphone permission denied', permError);
                setError('请允许麦克风权限');
                return;
            }

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.error(e);
                    // Sometimes start() throws if already starting
                }
            }
        }
    };

    return (
        <div className="voice-control-container" style={{ textAlign: 'center', margin: '2rem 0' }}>
            <button
                onClick={toggleListen}
                className={`btn btn-voice ${isListening ? 'listening' : ''}`}
                style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: isListening ? 'var(--color-danger)' : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: isListening ? '0 0 0 10px rgba(235, 77, 75, 0.3)' : 'var(--shadow-lg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isListening ? 'scale(1.1)' : 'scale(1)'
                }}
            >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            <p style={{ marginTop: '1rem', color: isListening ? 'var(--color-danger)' : 'var(--color-text-muted)', fontWeight: 'bold' }}>
                {error ? error : isListening ? '正在聆听...请说话' : '点击说话'}
            </p>
            {isListening && <div className="pulse-ring"></div>}
        </div>
    );
};

export default VoiceCommandButton;
