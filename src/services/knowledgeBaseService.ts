interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface KnowledgeBase {
  content: string;
  filename: string;
  uploadDate: Date;
  summary?: string;
}

class KnowledgeBaseService {
  private apiKey = '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';
  private baseUrl = 'https://openrouter.ai/api/v1';
  private knowledgeBase: KnowledgeBase | null = null;
  private chatHistory: ChatMessage[] = [];
  private isInitialized = false;
  private maxTokens = 8000; // Safe limit below API maximum
  private maxHistoryMessages = 6; // Keep recent conversation context

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      console.log('Initializing knowledge base service...');
      this.restoreKnowledgeBase();
      this.restoreChatHistory();
      this.isInitialized = true;
      console.log('Knowledge base service initialized successfully');
    } catch (error) {
      console.error('Error initializing knowledge base service:', error);
      this.isInitialized = true;
    }
  }

  private restoreKnowledgeBase() {
    try {
      const stored = localStorage.getItem('knowledgeBase');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.content && parsed.filename && parsed.uploadDate) {
          this.knowledgeBase = {
            ...parsed,
            uploadDate: new Date(parsed.uploadDate)
          };
          console.log('Successfully restored knowledge base from localStorage:', this.knowledgeBase.filename);
          console.log('Knowledge base content length:', this.knowledgeBase.content.length);
          return;
        }
      }
      console.log('No valid knowledge base found in localStorage');
    } catch (error) {
      console.error('Error restoring knowledge base:', error);
      localStorage.removeItem('knowledgeBase');
    }
  }

  private restoreChatHistory() {
    try {
      const stored = localStorage.getItem('chatHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.chatHistory = parsed
            .map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }))
            .slice(-this.maxHistoryMessages); // Keep only recent messages
          console.log('Restored chat history:', this.chatHistory.length, 'messages');
        }
      }
    } catch (error) {
      console.error('Error restoring chat history:', error);
      localStorage.removeItem('chatHistory');
    }
  }

  private saveKnowledgeBase() {
    try {
      if (this.knowledgeBase) {
        localStorage.setItem('knowledgeBase', JSON.stringify(this.knowledgeBase));
        console.log('Saved knowledge base to localStorage:', this.knowledgeBase.filename);
      } else {
        localStorage.removeItem('knowledgeBase');
        console.log('Removed knowledge base from localStorage');
      }
    } catch (error) {
      console.error('Error saving knowledge base:', error);
    }
  }

  private saveChatHistory() {
    try {
      // Only save recent messages to avoid storage bloat
      const recentHistory = this.chatHistory.slice(-this.maxHistoryMessages);
      if (recentHistory.length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(recentHistory));
        console.log('Saved chat history to localStorage:', recentHistory.length, 'messages');
      } else {
        localStorage.removeItem('chatHistory');
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  private createKnowledgeBaseSummary(content: string): string {
    // Create a concise summary for context
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const firstLines = lines.slice(0, 10).join('\n');
    const totalLines = lines.length;
    
    return `Document: ${this.knowledgeBase?.filename}
Lines: ${totalLines}
Preview: ${firstLines}${totalLines > 10 ? '\n...(content continues)' : ''}`;
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) {
            reject(new Error('Failed to read PDF content'));
            return;
          }
          const cleanText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
          resolve(cleanText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsText(file, 'utf-8');
    });
  }

  private async extractTextFromTXT(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) {
            reject(new Error('Failed to read TXT content'));
            return;
          }
          console.log('TXT file content extracted, length:', text.length);
          resolve(text.trim());
        } catch (error) {
          console.error('Error extracting TXT content:', error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read TXT file'));
      };
      reader.readAsText(file, 'utf-8');
    });
  }

  async uploadPDF(file: File): Promise<void> {
    try {
      const text = await this.extractTextFromPDF(file);
      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF file');
      }
      this.knowledgeBase = {
        content: text,
        filename: file.name,
        uploadDate: new Date(),
        summary: this.createKnowledgeBaseSummary(text)
      };
      this.saveKnowledgeBase();
      this.clearConversation();
      console.log('PDF uploaded and processed successfully, content length:', text.length);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  async uploadTXT(file: File): Promise<void> {
    try {
      const text = await this.extractTextFromTXT(file);
      if (!text || text.trim().length === 0) {
        throw new Error('The TXT file appears to be empty or unreadable');
      }
      this.knowledgeBase = {
        content: text,
        filename: file.name,
        uploadDate: new Date(),
        summary: this.createKnowledgeBaseSummary(text)
      };
      this.saveKnowledgeBase();
      this.clearConversation();
      console.log('TXT uploaded and processed successfully, content length:', text.length);
      console.log('Knowledge base set, hasKnowledgeBase should now return true');
    } catch (error) {
      console.error('Error uploading TXT:', error);
      throw new Error('Failed to process TXT file');
    }
  }

  private createSystemMessage(): string {
    const baseSystemMessage = `You are a professional AI assistant for MCBE Tiers, a competitive Minecraft Bedrock Edition tier ranking system. Your role is to provide accurate, helpful, and professional responses about the platform and its content.

Core Guidelines:
- Maintain a professional and helpful tone at all times
- Provide clear, accurate, and detailed responses
- Always stay focused on the topic at hand
- Be concise but comprehensive in your explanations
- When discussing tiers, ranks, or competitive aspects, be knowledgeable and authoritative

Platform Context:
MCBE Tiers is a competitive ranking platform for Minecraft Bedrock Edition players. It features:
- Tier-based ranking system (Tier 1-5, with High Tier and Low Tier subdivisions)
- Multiple game modes and categories
- Player statistics and leaderboards
- Professional tournament and competitive scene coverage`;

    if (this.knowledgeBase && this.knowledgeBase.content.trim().length > 0) {
      const summary = this.knowledgeBase.summary || this.createKnowledgeBaseSummary(this.knowledgeBase.content);
      return `${baseSystemMessage}

Document-Specific Knowledge:
You have access to the uploaded document "${this.knowledgeBase.filename}" which contains detailed information. Use this document to answer specific questions about its content while maintaining your professional demeanor.

${summary}

Instructions for Document-Based Responses:
- Reference the document content when directly asked about it
- Provide specific information from the document when relevant
- For general questions about MCBE Tiers, you can respond based on your general knowledge
- Always cite information accurately from the provided document`;
    }

    return `${baseSystemMessage}

Current Status:
No specific document is currently loaded. You can answer general questions about MCBE Tiers, competitive gaming, Minecraft Bedrock Edition, tier systems, and related topics. If users have specific document-related questions, inform them that they can upload documents through the Admin Panel for document-specific assistance.`;
  }

  async sendMessage(message: string): Promise<string> {
    console.log('=== SEND MESSAGE DEBUG START ===');
    console.log('sendMessage called with:', message);
    console.log('Knowledge base exists:', !!this.knowledgeBase);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    this.chatHistory.push(userMessage);
    
    // Keep only recent messages to manage memory
    if (this.chatHistory.length > this.maxHistoryMessages) {
      this.chatHistory = this.chatHistory.slice(-this.maxHistoryMessages);
    }
    
    this.saveChatHistory();
    console.log('Added user message to history, total messages:', this.chatHistory.length);

    const systemMessage = this.createSystemMessage();

    // Prepare conversation history for context
    const recentHistory = this.chatHistory.slice(-4); // Only recent context

    const requestPayload = {
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        ...recentHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      max_tokens: 300,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.1
    };

    console.log('Request payload prepared, message count:', requestPayload.messages.length);

    try {
      console.log('Making API request to OpenRouter...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MCBE-Tiers Professional Assistant'
        },
        body: JSON.stringify(requestPayload)
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error details:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response received successfully');

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid response structure from AI service');
      }

      const aiResponse = data.choices[0].message.content;
      console.log('AI response received, length:', aiResponse.length);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      this.chatHistory.push(assistantMessage);
      
      // Maintain history limit
      if (this.chatHistory.length > this.maxHistoryMessages) {
        this.chatHistory = this.chatHistory.slice(-this.maxHistoryMessages);
      }
      
      this.saveChatHistory();
      console.log('Added assistant message to history, total messages:', this.chatHistory.length);
      console.log('=== SEND MESSAGE DEBUG END (success) ===');
      
      return aiResponse;

    } catch (error) {
      console.error('=== ERROR IN SEND MESSAGE ===');
      console.error('Error details:', error);
      
      // Provide professional fallback response
      const fallbackResponse = "I apologize, but I'm experiencing technical difficulties at the moment. Please try again in a moment. If the issue persists, please contact the administrator for assistance.";
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };
      
      this.chatHistory.push(assistantMessage);
      this.saveChatHistory();
      console.log('=== SEND MESSAGE DEBUG END (error with fallback) ===');
      
      throw error; // Re-throw so the UI can handle it appropriately
    }
  }

  clearConversation(): void {
    this.chatHistory = [];
    this.saveChatHistory();
    console.log('Conversation cleared - starting fresh session');
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  hasKnowledgeBase(): boolean {
    const hasKb = this.knowledgeBase !== null && this.knowledgeBase.content.trim().length > 0;
    console.log('hasKnowledgeBase check:', hasKb, 'KB exists:', !!this.knowledgeBase);
    if (this.knowledgeBase) {
      console.log('KB filename:', this.knowledgeBase.filename, 'content length:', this.knowledgeBase.content.length);
    }
    return hasKb;
  }

  getKnowledgeBaseInfo(): { filename: string; uploadDate: Date } | null {
    if (!this.knowledgeBase) return null;
    return {
      filename: this.knowledgeBase.filename,
      uploadDate: this.knowledgeBase.uploadDate
    };
  }

  refreshKnowledgeBaseStatus(): boolean {
    this.restoreKnowledgeBase();
    return this.hasKnowledgeBase();
  }

  // Method to get conversation summary for debugging
  getConversationSummary(): string {
    return `Total messages: ${this.chatHistory.length}, KB loaded: ${!!this.knowledgeBase}, KB filename: ${this.knowledgeBase?.filename || 'None'}`;
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
