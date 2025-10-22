const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const IntentClassifier = require('./intent-classifier');
const FunctionRegistry = require('./function-registry');

class AssistantEngine {
    constructor() {
        this.intentClassifier = new IntentClassifier();
        this.functionRegistry = new FunctionRegistry();
        this.knowledgeBase = this.loadKnowledgeBase();
        this.llmBaseUrl = process.env.LLM_BASE_URL;

        // Normalize LLM base URL for robustness
        if (this.llmBaseUrl) {
            let u = this.llmBaseUrl.trim();
            if (!/^https?:\/\//i.test(u)) {
                u = `https://${u}`;
            }
            // remove trailing slashes
            u = u.replace(/\/+$/, '');
            this.llmBaseUrl = u;
        }
    }

    loadKnowledgeBase() {
        try {
            // Try the new ground-truth.json first - use absolute path
            const kbPath = path.join(process.cwd(), '../../docs/ground-truth.json');
            console.log('🔍 Looking for knowledge base at:', kbPath);
            if (fs.existsSync(kbPath)) {
                const data = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
                console.log('✅ Loaded knowledge base with', data.length, 'policies');
                return data;
            }

            // Fallback to existing knowledge-base.md
            const mdPath = path.join(__dirname, '../../docs/prompting/knowledge-base.md');
            console.log('🔍 Looking for markdown knowledge base at:', mdPath);
            if (fs.existsSync(mdPath)) {
                const content = fs.readFileSync(mdPath, 'utf8');
                const data = this.parseMarkdownKnowledgeBase(content);
                console.log('✅ Loaded markdown knowledge base with', data.length, 'policies');
                return data;
            }
        } catch (error) {
            console.error('❌ Error loading knowledge base:', error);
        }
        console.log('⚠️ No knowledge base found, using empty array');
        return [];
    }

    parseMarkdownKnowledgeBase(content) {
        // Parse the existing markdown knowledge base into structured format
        const sections = content.split('## Doc');
        const policies = [];

        sections.forEach((section, index) => {
            if (index === 0) return; // Skip the header

            const lines = section.trim().split('\n');
            const title = lines[0]?.trim();
            const content = lines.slice(1).join('\n').trim();

            if (title && content) {
                policies.push({
                    id: `Doc${index.toString().padStart(2, '0')}`,
                    question: title,
                    answer: content,
                    category: this.categorizeContent(title, content),
                    lastUpdated: new Date().toISOString()
                });
            }
        });

        return policies;
    }

    categorizeContent(title, content) {
        const text = (title + ' ' + content).toLowerCase();

        if (text.includes('return') || text.includes('refund')) return 'returns';
        if (text.includes('shipping') || text.includes('delivery')) return 'shipping';
        if (text.includes('payment') || text.includes('card')) return 'payment';
        if (text.includes('order') || text.includes('tracking')) return 'orders';
        if (text.includes('account') || text.includes('registration')) return 'account';
        if (text.includes('security') || text.includes('privacy')) return 'privacy';

        return 'general';
    }

    async processQuery(userInput, context = {}) {
        const startTime = Date.now();

        try {
            // Classify intent
            const intent = this.intentClassifier.classifyIntent(userInput);

            // Handle different intents
            let response;
            let functionsCalled = [];
            let citations = [];

            switch (intent) {
                case 'policy_question':
                    response = await this.handlePolicyQuestion(userInput);
                    citations = this.extractCitations(response);
                    break;

                case 'order_status':
                    response = await this.handleOrderStatus(userInput, context);
                    functionsCalled = ['getOrderStatus'];
                    break;

                case 'product_search':
                    response = await this.handleProductSearch(userInput);
                    functionsCalled = ['searchProducts'];
                    break;

                case 'complaint':
                    response = await this.handleComplaint(userInput);
                    break;

                case 'chitchat':
                    response = await this.handleChitchat(userInput);
                    break;

                case 'off_topic':
                    response = await this.handleOffTopic(userInput);
                    break;

                case 'violation':
                    response = await this.handleViolation(userInput);
                    break;

                default:
                    response = await this.handleDefault(userInput);
            }

            const responseTime = Date.now() - startTime;

            return {
                text: response,
                intent,
                citations,
                functionsCalled,
                responseTime,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error processing query:', error);
            return {
                text: "I apologize, but I'm experiencing some technical difficulties. Please try again or contact our support team directly.",
                intent: 'error',
                citations: [],
                functionsCalled: [],
                responseTime: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
        }
    }

    async handlePolicyQuestion(userInput) {
        // Find relevant policies using keyword matching
        const relevantPolicies = this.findRelevantPolicies(userInput);

        if (relevantPolicies.length === 0) {
            return "I'd be happy to help with policy questions! Could you be more specific about what you'd like to know? For example, you can ask about our return policy, shipping options, or warranty information.";
        }

        // Build context for LLM
        const policyContext = relevantPolicies.map(policy =>
            `[${policy.id}] ${policy.question}: ${policy.answer}`
        ).join('\n\n');

        const prompt = this.buildPolicyPrompt(userInput, policyContext);

        try {
            const llmResponse = await this.callLLM(prompt);
            return llmResponse;
        } catch (error) {
            // Fallback to direct policy response
            return relevantPolicies[0].answer + ` [${relevantPolicies[0].id}]`;
        }
    }

    async handleOrderStatus(userInput, context) {
        // Extract order ID from input
        const orderId = this.extractOrderId(userInput) || context.orderId;

        if (!orderId) {
            return "I'd be happy to help you check your order status! Could you please provide your order ID?";
        }

        try {
            const result = await this.functionRegistry.execute('getOrderStatus', { orderId });

            if (!result.success) {
                return `I couldn't find an order with ID ${orderId}. Please double-check your order ID and try again.`;
            }

            const order = result.data;
            return this.formatOrderStatus(order);
        } catch (error) {
            return "I'm having trouble accessing your order information right now. Please try again in a moment.";
        }
    }

    async handleProductSearch(userInput) {
        try {
            console.log('🔍 Product search for:', userInput);
            const result = await this.functionRegistry.execute('searchProducts', {
                query: userInput,
                limit: 3
            });
            console.log('🔍 Search result:', result);

            if (!result.success || result.data.length === 0) {
                return "I couldn't find any products matching your search. Could you try different keywords or browse our catalog?";
            }

            return this.formatProductSearch(result.data);
        } catch (error) {
            console.error('🔍 Product search error:', error);
            return "I'm having trouble searching our products right now. Please try again in a moment.";
        }
    }

    async handleComplaint(userInput) {
        const identity = this.intentClassifier.getAssistantIdentity();

        return `I'm really sorry to hear about this issue, and I understand your frustration. As ${identity.name}, I want to make sure we resolve this for you. Let me connect you with our senior support team who can provide immediate assistance. In the meantime, could you provide your order number so we can look into this right away?`;
    }

    async handleChitchat(userInput) {
        const identity = this.intentClassifier.getAssistantIdentity();

        const greetings = [
            `Hello! I'm ${identity.name}, your customer support specialist. How can I help you today?`,
            `Hi there! ${identity.name} here. What can I assist you with today?`,
            `Good to meet you! I'm ${identity.name} and I'm here to help with any questions about our products or orders.`
        ];

        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    async handleOffTopic(userInput) {
        return "I'd be happy to chat, but I'm here specifically to help with questions about our products, orders, and policies. Is there anything store-related I can assist you with?";
    }

    async handleViolation(userInput) {
        return "I'm here to help with customer service questions in a respectful manner. If you have questions about our products, orders, or policies, I'd be happy to assist you.";
    }

    async handleDefault(userInput) {
        const identity = this.intentClassifier.getAssistantIdentity();
        return `I'm ${identity.name}, your customer support specialist. I can help you with questions about our products, order status, shipping, returns, and more. What would you like to know?`;
    }

    findRelevantPolicies(userInput) {
        const input = userInput.toLowerCase();
        console.log('🔍 Finding policies for:', input);
        console.log('📚 Knowledge base size:', this.knowledgeBase.length);

        const categoryKeywords = {
            'returns': ['return', 'refund', 'exchange', 'money back'],
            'shipping': ['shipping', 'delivery', 'ship', 'transit', 'carrier'],
            'warranty': ['warranty', 'guarantee', 'defect', 'broken'],
            'privacy': ['privacy', 'data', 'personal', 'information'],
            'payment': ['payment', 'billing', 'charge', 'credit', 'debit']
        };

        let matchedCategory = null;
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(kw => input.includes(kw))) {
                matchedCategory = category;
                console.log('✅ Matched category:', category);
                break;
            }
        }

        const results = matchedCategory
            ? this.knowledgeBase.filter(p => p.category === matchedCategory)
            : this.knowledgeBase.slice(0, 3); // Return first 3 if no category match

        console.log('📋 Found policies:', results.length);
        return results;
    }

    extractOrderId(input) {
        // Look for order ID patterns
        const orderIdPattern = /\b[A-Za-z0-9]{6,}\b/;
        const match = input.match(orderIdPattern);
        return match ? match[0] : null;
    }

    extractCitations(text) {
        const citationPattern = /\[([A-Za-z0-9.]+)\]/g;
        const citations = [];
        let match;
        while ((match = citationPattern.exec(text)) !== null) {
            citations.push(match[1]);
        }
        return citations;
    }

    buildPolicyPrompt(userInput, policyContext) {
        const identity = this.intentClassifier.getAssistantIdentity();

        return `You are a ShopLite assistant. Answer ONLY if the provided context snippets contain the information. If not, refuse.

User Question: ${userInput}

Context Snippets:
${policyContext}

Rules:
- Use only the snippets; do not invent facts.
- Be terse and precise. If a single fact is asked, reply in ONE sentence.
- Cite sources by document **title** joined with semicolons.
- Output exactly two lines: "Answer: <...>" and "Sources: <Title A>; <Title B>"
- Never mention that you're an AI or language model
- Be helpful and professional

Format:
Answer: <your answer>
Sources: <Title A>; <Title B>`;
    }

    async callLLM(prompt) {
        if (!this.llmBaseUrl) {
            throw new Error('LLM base URL not configured');
        }

        try {
            const response = await axios.post(`${this.llmBaseUrl}/ping`, {
                prompt
            }, {
                timeout: 10000
            });

            return response.data.output || 'I apologize, but I had trouble processing your request.';
        } catch (error) {
            console.error('LLM call failed:', error);
            throw error;
        }
    }

    formatOrderStatus(order) {
        const statusEmojis = {
            'PENDING': '⏳',
            'PROCESSING': '🔄',
            'SHIPPED': '📦',
            'DELIVERED': '✅'
        };

        let response = `Your order ${order.orderId} is currently ${order.status} ${statusEmojis[order.status]}\n\n`;

        if (order.carrier && order.trackingNumber) {
            response += `Tracking: ${order.carrier} - ${order.trackingNumber}\n`;
        }

        if (order.estimatedDelivery) {
            response += `Estimated delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}\n`;
        }

        response += `Total: $${order.total.toFixed(2)}\n`;
        response += `Items: ${order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}`;

        return response;
    }

    formatProductSearch(products) {
        let response = "Here are some products that match your search:\n\n";

        products.forEach((product, index) => {
            response += `${index + 1}. **${product.name}** - $${product.price}\n`;
            if (product.description) {
                response += `   ${product.description}\n`;
            }
            response += `   Stock: ${product.stock} available\n\n`;
        });

        return response;
    }
}

module.exports = AssistantEngine;
