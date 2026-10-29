export class VoiceSearchService {
  private isListening = false;
  
  async startListening(onResult: (text: string) => void, onError: (err: string) => void): Promise<void> {
    if (this.isListening) return;
    this.isListening = true;
    
    // Mocking voice recognition delay
    setTimeout(() => {
      if (!this.isListening) return;
      this.isListening = false;
      // Return a mocked recognized string
      onResult('Find buses from Esplanade to Salt Lake');
    }, 2500);
  }

  stopListening(): void {
    this.isListening = false;
  }

  // A helper to parse the voice string into origin and destination
  parseLocations(text: string): { origin: string | null, destination: string | null } {
    const match = text.match(/from (.*?) to (.*)/i);
    if (match && match.length >= 3) {
      return {
        origin: match[1].trim(),
        destination: match[2].trim()
      };
    }
    return { origin: null, destination: null };
  }
}

export const voiceSearchService = new VoiceSearchService();
