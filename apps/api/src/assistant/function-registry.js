const { Order, Product, Customer } = require('../db');

class FunctionRegistry {
    constructor() {
        this.functions = new Map();
        this.registerDefaultFunctions();
    }

    registerDefaultFunctions() {
        // Register getOrderStatus function
        this.register('getOrderStatus', {
            description: 'Get the status of a specific order',
            parameters: {
                type: 'object',
                properties: {
                    orderId: {
                        type: 'string',
                        description: 'The order ID to check'
                    }
                },
                required: ['orderId']
            },
            handler: this.getOrderStatus.bind(this)
        });

        // Register searchProducts function
        this.register('searchProducts', {
            description: 'Search for products based on query',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search query for products'
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of products to return',
                        default: 5
                    }
                },
                required: ['query']
            },
            handler: this.searchProducts.bind(this)
        });

        // Register getCustomerOrders function
        this.register('getCustomerOrders', {
            description: 'Get orders for a specific customer',
            parameters: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        description: 'Customer email address'
                    }
                },
                required: ['email']
            },
            handler: this.getCustomerOrders.bind(this)
        });
    }

    register(name, config) {
        this.functions.set(name, config);
    }

    getAllSchemas() {
        const schemas = {};
        for (const [name, config] of this.functions) {
            schemas[name] = {
                description: config.description,
                parameters: config.parameters
            };
        }
        return schemas;
    }

    async execute(functionName, parameters) {
        const func = this.functions.get(functionName);
        if (!func) {
            throw new Error(`Function ${functionName} not found`);
        }

        try {
            return await func.handler(parameters);
        } catch (error) {
            console.error(`Error executing function ${functionName}:`, error);
            throw error;
        }
    }

    // Function implementations
    async getOrderStatus(parameters) {
        const { orderId } = parameters;

        try {
            const order = await Order.findById(orderId)
                .populate('customerId', 'name email');

            if (!order) {
                return {
                    success: false,
                    error: 'Order not found',
                    data: null
                };
            }

            return {
                success: true,
                data: {
                    orderId: order._id,
                    status: order.status,
                    carrier: order.carrier,
                    trackingNumber: order.trackingNumber,
                    estimatedDelivery: order.estimatedDelivery,
                    total: order.total,
                    items: order.items,
                    customer: order.customerId
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to fetch order status',
                data: null
            };
        }
    }

    async searchProducts(parameters) {
        const { query, limit = 5 } = parameters;

        if (!query || typeof query !== 'string' || !query.trim()) {
            return { success: true, data: [] };
        }

        console.log('Search products called with:', { query, limit, parameters });

        try {
            // Broaden search across key fields with case-insensitive partial matches
            const products = await Product.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                    { tags: { $elemMatch: { $regex: query, $options: 'i' } } }
                ]
            })
                .limit(limit)
                .select('name description price imageUrl stock')
                .lean();

            return {
                success: true,
                data: products
            };
        } catch (error) {
            console.error('Search products error:', error);
            return {
                success: false,
                error: `Failed to search products: ${error.message}`,
                data: []
            };
        }
    }

    async getCustomerOrders(parameters) {
        const { email } = parameters;

        try {
            const customer = await Customer.findOne({ email });
            if (!customer) {
                return {
                    success: false,
                    error: 'Customer not found',
                    data: []
                };
            }

            const orders = await Order.find({ customerId: customer._id })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('_id status total createdAt items');

            return {
                success: true,
                data: {
                    customer: {
                        name: customer.name,
                        email: customer.email
                    },
                    orders
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to fetch customer orders',
                data: []
            };
        }
    }
}

module.exports = FunctionRegistry;
