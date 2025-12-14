import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, X, Activity, Volume2, Sparkles } from 'lucide-react';
import { createPcmBlob, decodeAudioData, decodeBase64 } from '../services/audioUtils';
import { ConnectionState } from '../types';

const API_KEY = process.env.API_KEY || '';
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

// Canvas visualizer configuration
const VISUALIZER_BARS = 30;

const VoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  
  // Audio Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<Promise<any> | null>(null);
  const sessionObjRef = useRef<any>(null); // To hold the actual session object for cleanup

  // Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Audio Contexts
  const initAudioContexts = () => {
    if (!inputContextRef.current) {
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!outputContextRef.current) {
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Modern styling for bars
      const barWidth = (canvas.width / VISUALIZER_BARS) * 0.6;
      const gap = (canvas.width / VISUALIZER_BARS) * 0.4;
      let x = 0;

      // Center the visualizer
      const totalWidth = (barWidth + gap) * VISUALIZER_BARS;
      const startX = (canvas.width - totalWidth) / 2;
      x = startX;

      for (let i = 0; i < VISUALIZER_BARS; i++) {
        // Pick frequencies spread across the spectrum, focusing on lower-mid range for voice
        const index = Math.floor(i * (bufferLength / (VISUALIZER_BARS * 2))); 
        const value = dataArray[index];
        const percent = value / 255;
        const height = Math.max(4, percent * canvas.height * 0.8);
        
        // Gradient color
        const gradient = ctx.createLinearGradient(0, canvas.height/2 - height/2, 0, canvas.height/2 + height/2);
        gradient.addColorStop(0, '#14b8a6'); // Teal-500
        gradient.addColorStop(1, '#ccfbf1'); // Teal-100

        ctx.fillStyle = gradient;
        
        // Rounded bars
        ctx.beginPath();
        ctx.roundRect(x, (canvas.height - height) / 2, barWidth, height, barWidth / 2);
        ctx.fill();

        x += barWidth + gap;
      }
    };

    draw();
  };

  const connect = async () => {
    setErrorMessage(null);
    setConnectionState(ConnectionState.CONNECTING);
    
    try {
      initAudioContexts();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermissions(true);

      const ai = new GoogleGenAI({ apiKey: API_KEY });

      // Setup output analyser
      if (outputContextRef.current) {
         analyserRef.current = outputContextRef.current.createAnalyser();
         analyserRef.current.fftSize = 256;
         drawVisualizer();
      }

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setConnectionState(ConnectionState.CONNECTED);
            
            // Setup Input Streaming
            if (!inputContextRef.current) return;
            const source = inputContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputContextRef.current) {
                const ctx = outputContextRef.current;
                // Sync start time
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = decodeAudioData(
                  decodeBase64(base64Audio),
                  ctx,
                  24000,
                  1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                
                // Connect to analyser for visualization and then to destination
                if (analyserRef.current) {
                    source.connect(analyserRef.current);
                    analyserRef.current.connect(ctx.destination);
                } else {
                    source.connect(ctx.destination);
                }

                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
             }

             // Handle Interruptions
             if (message.serverContent?.interrupted) {
                console.log('Model interrupted');
                sourcesRef.current.forEach(s => {
                    try { s.stop(); } catch(e) {}
                });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            setConnectionState(ConnectionState.DISCONNECTED);
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setConnectionState(ConnectionState.ERROR);
            setErrorMessage("Connection error. Please try again.");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `You are Aria, the intelligent, humble, and exceedingly polite virtual receptionist for Ajit Fitness. 
          Your tone is incredibly warm, respectful, professional, and encouraging. You assist members with class schedules, membership details, and facility information.
          Always use extremely polite phrases such as 'It would be my absolute pleasure', 'Certainly, honored guest', 'I would be delighted to assist you', and 'Thank you so very much for asking'.
          If you cannot answer a question, apologize sincerely.
          If asked about medical advice, politely and humbly decline, recommending a professional.
          Keep responses concise but gracious, suitable for a voice conversation.
          Start by greeting the user warmly and politely to Ajit Fitness.`
        }
      });
      
      sessionRef.current = sessionPromise;
      // Store session object for cleanup
      sessionPromise.then(sess => {
          sessionObjRef.current = sess;
      });

    } catch (e) {
      console.error(e);
      setConnectionState(ConnectionState.ERROR);
      setErrorMessage("Could not access microphone.");
    }
  };

  const disconnect = useCallback(() => {
    // Stop audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Disconnect script processor
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    // Stop all playing sources
    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e){}
    });
    sourcesRef.current.clear();

    // Close session
    if (sessionObjRef.current) {
       // There isn't a direct close() on the session object in the provided snippet, 
       // but typically we close the WebSocket. The prompt example uses session.close().
       // If the type def is loose, we cast.
       try {
           (sessionObjRef.current as any).close(); 
       } catch(e) { console.warn("Could not close session explicitly", e)}
    }

    // Stop visualizer
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
    }

    setConnectionState(ConnectionState.DISCONNECTED);
    nextStartTimeRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (inputContextRef.current?.state !== 'closed') inputContextRef.current?.close();
      if (outputContextRef.current?.state !== 'closed') outputContextRef.current?.close();
    };
  }, [disconnect]);

  const toggleConnection = () => {
    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) {
      disconnect();
    } else {
      connect();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-full shadow-lg shadow-brand-900/50 transition-all hover:scale-105 group"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="font-semibold pr-2 hidden group-hover:block transition-all duration-300">Chat with Aria</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
      <div className="bg-brand-950/90 backdrop-blur-xl border border-brand-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-brand-900/50 border-b border-brand-500/20">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${connectionState === ConnectionState.CONNECTED ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-gray-400'}`} />
            <h3 className="font-display font-semibold text-lg text-white">Aria Assistant</h3>
          </div>
          <button 
            onClick={() => {
                disconnect();
                setIsOpen(false);
            }} 
            className="text-brand-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer Area */}
        <div className="h-40 bg-black/40 relative flex items-center justify-center overflow-hidden">
            {connectionState === ConnectionState.CONNECTED ? (
                <canvas 
                    ref={canvasRef} 
                    width={350} 
                    height={160} 
                    className="w-full h-full opacity-90"
                />
            ) : (
                <div className="text-brand-300/50 flex flex-col items-center gap-2">
                    <Activity className="w-12 h-12" />
                    <span className="text-sm">Ready to connect</span>
                </div>
            )}
            
            {connectionState === ConnectionState.CONNECTING && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-400"></div>
                 </div>
            )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gradient-to-t from-brand-950 to-brand-900/80">
          {errorMessage && (
            <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-xs text-center">
                {errorMessage}
            </div>
          )}
          
          <div className="flex justify-center">
            <button
                onClick={toggleConnection}
                disabled={connectionState === ConnectionState.CONNECTING}
                className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                    ${connectionState === ConnectionState.CONNECTED 
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-900/50' 
                        : 'bg-brand-500 hover:bg-brand-400 shadow-brand-900/50'
                    }
                `}
            >
                {connectionState === ConnectionState.CONNECTED ? (
                    <MicOff className="w-6 h-6 text-white" />
                ) : (
                    <Mic className="w-6 h-6 text-white" />
                )}
                
                {/* Ping animation when ready to connect */}
                {connectionState === ConnectionState.DISCONNECTED && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-20 animate-ping"></span>
                )}
            </button>
          </div>
          
          <p className="text-center text-brand-200/60 text-xs mt-4">
             {connectionState === ConnectionState.CONNECTED 
                ? "Listening... Speak naturally." 
                : "Tap microphone to speak with our AI agent"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;