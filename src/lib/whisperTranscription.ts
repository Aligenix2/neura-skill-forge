import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for Whisper
env.allowLocalModels = false;
env.useBrowserCache = true;

let whisperModel: any = null;

export async function initializeWhisper() {
  if (!whisperModel) {
    try {
      console.log('Initializing Whisper model...');
      whisperModel = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny.en',
        { device: 'webgpu' }
      );
      console.log('Whisper model initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Whisper with WebGPU, falling back to CPU:', error);
      try {
        whisperModel = await pipeline(
          'automatic-speech-recognition',
          'onnx-community/whisper-tiny.en'
        );
        console.log('Whisper model initialized with CPU');
      } catch (fallbackError) {
        console.error('Failed to initialize Whisper model:', fallbackError);
        throw new Error('Could not initialize speech recognition model');
      }
    }
  }
  return whisperModel;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    console.log('Starting audio transcription...');
    
    // Initialize Whisper if not already done
    const model = await initializeWhisper();
    
    // Convert blob to audio buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Transcribe using Whisper
    const result = await model(arrayBuffer);
    
    console.log('Transcription completed:', result.text);
    return result.text || '';
    
  } catch (error) {
    console.error('Transcription failed:', error);
    
    // Fallback to Web Speech API
    return await fallbackTranscription(audioBlob);
  }
}

async function fallbackTranscription(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('Using fallback Web Speech API transcription...');
    
    // Check if Web Speech API is available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    let finalTranscript = '';
    
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
    };
    
    recognition.onend = () => {
      resolve(finalTranscript.trim());
    };
    
    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };
    
    // Create audio element and play for recognition
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);
    
    recognition.start();
    audio.play();
    
    // Stop recognition when audio ends
    audio.onended = () => {
      setTimeout(() => recognition.stop(), 1000);
    };
  });
}

// Real-time transcription for live feedback
export class RealTimeTranscriber {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private onTranscriptUpdate: (transcript: string) => void;
  private isRecording = false;
  
  constructor(onTranscriptUpdate: (transcript: string) => void) {
    this.onTranscriptUpdate = onTranscriptUpdate;
  }
  
  async startRealTimeTranscription(stream: MediaStream) {
    try {
      this.isRecording = true;
      this.audioChunks = [];
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          
          // Process chunks every 3 seconds for real-time feedback
          if (this.audioChunks.length >= 3) {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            try {
              const transcript = await transcribeAudio(audioBlob);
              this.onTranscriptUpdate(transcript);
            } catch (error) {
              console.warn('Real-time transcription chunk failed:', error);
            }
            this.audioChunks = []; // Reset for next chunk
          }
        }
      };
      
      this.mediaRecorder.start(1000); // Collect data every second
      console.log('Real-time transcription started');
      
    } catch (error) {
      console.error('Failed to start real-time transcription:', error);
      throw error;
    }
  }
  
  stopRealTimeTranscription(): Blob | null {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // Return final audio blob
      return new Blob(this.audioChunks, { type: 'audio/webm' });
    }
    return null;
  }
}