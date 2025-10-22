const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class IntentClassifier {
    constructor() {
        this.intents = [
            'policy_question',
            'order_status',
            'product_search',
            'complaint',
            'chitchat',
            'off_topic',
            'violation'
        ];

        this.loadConfig();
    }

    loadConfig() {
        try {
            const configPath = path.join(__dirname, '../../docs/prompts.yaml');
            if (fs.existsSync(configPath)) {
                const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
                this.config = config;
            } else {
                this.config = this.getDefaultConfig();
            }
        } catch (error) {
            console.error('Error loading assistant config:', error);
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            identity: {
                name: "Alex",
                role: "Customer Support Specialist",
                personality: "Friendly, helpful, and professional"
            },
            intents: {
                policy_question: {
                    keywords: ['policy', 'return', 'refund', 'warranty', 'shipping', 'delivery', 'privacy', 'terms'],
                    behavior: 'Provide detailed policy information with citations'
                },
                order_status: {
                    keywords: ['order', 'tracking', 'status', 'delivery', 'shipped', 'where is my order'],
                    behavior: 'Check order status and provide tracking information'
                },
                product_search: {
                    keywords: ['product', 'search', 'find', 'looking for', 'available', 'in stock'],
                    behavior: 'Search products and provide recommendations'
                },
                complaint: {
                    keywords: ['problem', 'issue', 'complaint', 'wrong', 'broken', 'defective', 'angry', 'frustrated'],
                    behavior: 'Show empathy and escalate to human support'
                },
                chitchat: {
                    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'how are you', 'thanks', 'thank you'],
                    behavior: 'Be friendly and redirect to support topics'
                },
                off_topic: {
                    keywords: ['weather', 'sports', 'politics', 'unrelated'],
                    behavior: 'Politely redirect to store-related topics'
                },
                violation: {
                    keywords: ['hate', 'abuse', 'inappropriate', 'offensive'],
                    behavior: 'Set clear boundaries and redirect'
                }
            }
        };
    }

    classifyIntent(userInput) {
        const input = userInput.toLowerCase().trim();

        // Check for violation first (highest priority)
        if (this.matchesIntent(input, 'violation')) {
            return 'violation';
        }

        // Check for order status (look for order ID patterns)
        if (this.matchesOrderStatus(input)) {
            return 'order_status';
        }

        // Check other intents
        for (const intent of this.intents) {
            if (intent === 'violation' || intent === 'order_status') continue;

            if (this.matchesIntent(input, intent)) {
                return intent;
            }
        }

        // Default to chitchat if no clear intent
        return 'chitchat';
    }

    matchesIntent(input, intent) {
        const intentConfig = this.config.intents[intent];
        if (!intentConfig) return false;

        return intentConfig.keywords.some(keyword =>
            input.includes(keyword.toLowerCase())
        );
    }

    matchesOrderStatus(input) {
        // Look for order ID patterns (alphanumeric, 6+ characters)
        const orderIdPattern = /\b[A-Za-z0-9]{6,}\b/;
        const orderKeywords = ['order', 'tracking', 'status', 'where is my order', 'my order'];

        // Only match if there's an actual order ID pattern OR specific order-related phrases
        return (orderIdPattern.test(input) && input.includes('order')) ||
            orderKeywords.some(keyword => input.includes(keyword));
    }

    getIntentBehavior(intent) {
        return this.config.intents[intent]?.behavior || 'Provide helpful assistance';
    }

    getAssistantIdentity() {
        return this.config.identity;
    }
}

module.exports = IntentClassifier;
