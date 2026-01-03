import { useState } from 'react';
import { Mic, MicOff, AlertCircle, Volume2 } from 'lucide-react';

// Simplified version since Dashboard handles the main interaction via keyboard overlay now.
// We keep this for the Icon export and potentially for Web fallback if needed.
const VoiceCommandButton = ({ onCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [statusText, setStatusText] = useState('点击开始说话');

    // Web Speech Fallback for Development/PC
    const startListening = () => {
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

        try {
            recognition.start();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ textAlign: 'center', margin: 'var(--spacing-xl) 0' }}>
            <button
                onClick={startListening}
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
            <p>{statusText}</p>
        </div>
    );
};

VoiceCommandButton.Icon = Mic;

export default VoiceCommandButton;
