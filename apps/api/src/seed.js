const mongoose = require('mongoose');
const { Customer, Product, Order } = require('./db');
require('dotenv').config();

// Sample data
const customers = [
    {
        name: "John Smith",
        email: "demo@example.com", // Test user for evaluation
        phone: "+1-555-0123",
        address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA"
        }
    },
    {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1-555-0124",
        address: {
            street: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90210",
            country: "USA"
        }
    },
    {
        name: "Mike Chen",
        email: "mike.chen@email.com",
        phone: "+1-555-0125",
        address: {
            street: "789 Pine St",
            city: "Chicago",
            state: "IL",
            zipCode: "60601",
            country: "USA"
        }
    },
    {
        name: "Emily Davis",
        email: "emily.davis@email.com",
        phone: "+1-555-0126",
        address: {
            street: "321 Elm St",
            city: "Houston",
            state: "TX",
            zipCode: "77001",
            country: "USA"
        }
    },
    {
        name: "David Wilson",
        email: "david.wilson@email.com",
        phone: "+1-555-0127",
        address: {
            street: "654 Maple Dr",
            city: "Phoenix",
            state: "AZ",
            zipCode: "85001",
            country: "USA"
        }
    },
    {
        name: "Lisa Brown",
        email: "lisa.brown@email.com",
        phone: "+1-555-0128",
        address: {
            street: "987 Cedar Ln",
            city: "Philadelphia",
            state: "PA",
            zipCode: "19101",
            country: "USA"
        }
    },
    {
        name: "Robert Taylor",
        email: "robert.taylor@email.com",
        phone: "+1-555-0129",
        address: {
            street: "147 Birch St",
            city: "San Antonio",
            state: "TX",
            zipCode: "78201",
            country: "USA"
        }
    },
    {
        name: "Jennifer Garcia",
        email: "jennifer.garcia@email.com",
        phone: "+1-555-0130",
        address: {
            street: "258 Spruce Ave",
            city: "San Diego",
            state: "CA",
            zipCode: "92101",
            country: "USA"
        }
    },
    {
        name: "Michael Martinez",
        email: "michael.martinez@email.com",
        phone: "+1-555-0131",
        address: {
            street: "369 Willow Way",
            city: "Dallas",
            state: "TX",
            zipCode: "75201",
            country: "USA"
        }
    },
    {
        id: 1,
        name: "Amanda Rodriguez",
        email: "amanda.rodriguez@email.com",
        phone: "+1-555-0132",
        address: {
            street: "741 Poplar Pl",
            city: "San Jose",
            state: "CA",
            zipCode: "95101",
            country: "USA"
        }
    },
    {
        name: "Christopher Lee",
        email: "christopher.lee@email.com",
        phone: "+1-555-0133",
        address: {
            street: "852 Ash Blvd",
            city: "Austin",
            state: "TX",
            zipCode: "73301",
            country: "USA"
        }
    },
    {
        name: "Jessica White",
        email: "jessica.white@email.com",
        phone: "+1-555-0134",
        address: {
            street: "963 Hickory Rd",
            city: "Jacksonville",
            state: "FL",
            zipCode: "32201",
            country: "USA"
        }
    },
    {
        name: "Daniel Harris",
        email: "daniel.harris@email.com",
        phone: "+1-555-0135",
        address: {
            street: "159 Sycamore St",
            city: "Fort Worth",
            state: "TX",
            zipCode: "76101",
            country: "USA"
        }
    },
    {
        name: "Ashley Clark",
        email: "ashley.clark@email.com",
        phone: "+1-555-0136",
        address: {
            street: "357 Magnolia Dr",
            city: "Columbus",
            state: "OH",
            zipCode: "43201",
            country: "USA"
        }
    },
    {
        name: "Matthew Lewis",
        email: "matthew.lewis@email.com",
        phone: "+1-555-0137",
        address: {
            street: "468 Dogwood Ln",
            city: "Charlotte",
            state: "NC",
            zipCode: "28201",
            country: "USA"
        }
    }
];

const products = [
    {
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life",
        price: 199.99,
        category: "Electronics",
        tags: ["wireless", "bluetooth", "noise-cancellation", "audio"],
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        stock: 50
    },
    {
        name: "Smart Fitness Watch",
        description: "Advanced fitness tracking with heart rate monitor, GPS, and water resistance",
        price: 299.99,
        category: "Electronics",
        tags: ["fitness", "smartwatch", "health", "tracking"],
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        stock: 30
    },
    {
        name: "Organic Cotton T-Shirt",
        description: "Comfortable 100% organic cotton t-shirt in various colors",
        price: 24.99,
        category: "Clothing",
        tags: ["organic", "cotton", "sustainable", "casual"],
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        stock: 100
    },
    {
        name: "Stainless Steel Water Bottle",
        description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours",
        price: 34.99,
        category: "Accessories",
        tags: ["stainless-steel", "insulated", "eco-friendly", "bottle"],
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
        stock: 75
    },
    {
        name: "LED Desk Lamp",
        description: "Adjustable LED desk lamp with USB charging port and touch controls",
        price: 89.99,
        category: "Home & Office",
        tags: ["led", "desk", "adjustable", "usb"],
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        stock: 40
    },
    {
        name: "Yoga Mat Premium",
        description: "Non-slip yoga mat made from eco-friendly materials with carrying strap",
        price: 49.99,
        category: "Sports & Fitness",
        tags: ["yoga", "eco-friendly", "non-slip", "fitness"],
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
        stock: 60
    },
    {
        name: "Wireless Phone Charger",
        description: "Fast wireless charging pad compatible with all Qi-enabled devices",
        price: 39.99,
        category: "Electronics",
        tags: ["wireless", "charging", "qi", "phone"],
        imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
        stock: 80
    },
    {
        name: "Leather Crossbody Bag",
        description: "Genuine leather crossbody bag with multiple compartments",
        price: 129.99,
        category: "Accessories",
        tags: ["leather", "crossbody", "bag", "fashion"],
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        stock: 25
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with 360-degree sound and waterproof design",
        price: 79.99,
        category: "Electronics",
        tags: ["bluetooth", "speaker", "portable", "waterproof"],
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
        stock: 45
    },
    {
        name: "Coffee Maker Programmable",
        description: "12-cup programmable coffee maker with auto-shutoff and brew strength control",
        price: 149.99,
        category: "Home & Kitchen",
        tags: ["coffee", "programmable", "12-cup", "kitchen"],
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
        stock: 35
    },
    {
        name: "Running Shoes Athletic",
        description: "Lightweight running shoes with breathable mesh and cushioned sole",
        price: 119.99,
        category: "Sports & Fitness",
        tags: ["running", "shoes", "athletic", "breathable"],
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        stock: 70
    },
    {
        name: "Laptop Stand Adjustable",
        description: "Ergonomic aluminum laptop stand with adjustable height and angle",
        price: 69.99,
        category: "Home & Office",
        tags: ["laptop", "stand", "ergonomic", "adjustable"],
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
        stock: 55
    },
    {
        name: "Essential Oil Diffuser",
        description: "Ultrasonic essential oil diffuser with LED lights and timer function",
        price: 59.99,
        category: "Home & Wellness",
        tags: ["essential-oils", "diffuser", "ultrasonic", "wellness"],
        imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400",
        stock: 40
    },
    {
        name: "Backpack Travel",
        description: "Durable travel backpack with laptop compartment and multiple pockets",
        price: 89.99,
        category: "Travel & Luggage",
        tags: ["backpack", "travel", "laptop", "durable"],
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        stock: 30
    },
    {
        name: "Smart Home Hub",
        description: "Voice-controlled smart home hub compatible with Alexa and Google Assistant",
        price: 199.99,
        category: "Smart Home",
        tags: ["smart-home", "hub", "voice-control", "automation"],
        imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
        stock: 20
    },
    {
        name: "Ceramic Dinner Set",
        description: "16-piece ceramic dinner set with modern design and dishwasher safe",
        price: 79.99,
        category: "Home & Kitchen",
        tags: ["ceramic", "dinner-set", "dishwasher-safe", "kitchen"],
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
        stock: 50
    },
    {
        name: "Gaming Mouse RGB",
        description: "High-precision gaming mouse with RGB lighting and programmable buttons",
        price: 79.99,
        category: "Gaming",
        tags: ["gaming", "mouse", "rgb", "programmable"],
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
        stock: 65
    },
    {
        name: "Plant Pot Ceramic",
        description: "Handcrafted ceramic plant pot with drainage holes and saucer",
        price: 29.99,
        category: "Home & Garden",
        tags: ["plant-pot", "ceramic", "handcrafted", "garden"],
        imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
        stock: 90
    },
    {
        name: "Phone Case Protective",
        description: "Shock-absorbing phone case with raised edges and wireless charging compatibility",
        price: 24.99,
        category: "Accessories",
        tags: ["phone-case", "protective", "shock-absorbing", "wireless-charging"],
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
        stock: 120
    },
    {
        name: "Tea Set Ceramic",
        description: "Traditional ceramic tea set with teapot, cups, and serving tray",
        price: 99.99,
        category: "Home & Kitchen",
        tags: ["tea-set", "ceramic", "traditional", "kitchen"],
        imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
        stock: 25
    },
    {
        name: "Bluetooth Earbuds",
        description: "True wireless earbuds with active noise cancellation and 8-hour battery",
        price: 159.99,
        category: "Electronics",
        tags: ["wireless", "earbuds", "noise-cancellation", "audio"],
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
        stock: 40
    },
    {
        name: "Desk Organizer Bamboo",
        description: "Sustainable bamboo desk organizer with multiple compartments",
        price: 49.99,
        category: "Home & Office",
        tags: ["bamboo", "desk-organizer", "sustainable", "office"],
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
        stock: 35
    },
    {
        name: "Resistance Bands Set",
        description: "Set of 5 resistance bands with different resistance levels and door anchor",
        price: 34.99,
        category: "Sports & Fitness",
        tags: ["resistance-bands", "fitness", "exercise", "home-workout"],
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
        stock: 60
    },
    {
        name: "LED Strip Lights",
        description: "Smart LED strip lights with app control and 16 million colors",
        price: 39.99,
        category: "Smart Home",
        tags: ["led-strip", "smart", "app-control", "colors"],
        imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
        stock: 80
    },
    {
        name: "Insulated Travel Mug",
        description: "Double-wall insulated travel mug that keeps drinks hot for 6 hours",
        price: 19.99,
        category: "Accessories",
        tags: ["travel-mug", "insulated", "hot-drinks", "portable"],
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
        stock: 100
    },
    {
        name: "Wireless Keyboard",
        description: "Slim wireless keyboard with scissor-switch keys and 2-year battery life",
        price: 69.99,
        category: "Electronics",
        tags: ["wireless", "keyboard", "slim", "battery"],
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
        stock: 45
    },
    {
        name: "Aromatherapy Candle Set",
        description: "Set of 3 soy wax candles with essential oils in relaxing scents",
        price: 44.99,
        category: "Home & Wellness",
        tags: ["candles", "soy-wax", "aromatherapy", "wellness"],
        imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400",
        stock: 30
    },
    {
        name: "Portable Power Bank",
        description: "High-capacity power bank with fast charging and multiple ports",
        price: 54.99,
        category: "Electronics",
        tags: ["power-bank", "portable", "fast-charging", "battery"],
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
        stock: 70
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/storefront', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await Customer.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        // Seed customers
        console.log('👥 Seeding customers...');
        const createdCustomers = await Customer.insertMany(customers);
        console.log(`✅ Created ${createdCustomers.length} customers`);

        // Seed products
        console.log('📦 Seeding products...');
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ Created ${createdProducts.length} products`);

        // Create orders for some customers
        console.log('📋 Creating orders...');
        const orders = [];

        // Create orders for demo user (demo@example.com)
        const demoUser = createdCustomers.find(c => c.email === 'demo@example.com');
        if (demoUser) {
            // Order 1 for demo user
            orders.push({
                customerId: demoUser._id,
                items: [
                    {
                        productId: createdProducts[0]._id, // Wireless Headphones
                        name: createdProducts[0].name,
                        price: createdProducts[0].price,
                        quantity: 1
                    },
                    {
                        productId: createdProducts[2]._id, // Organic Cotton T-Shirt
                        name: createdProducts[2].name,
                        price: createdProducts[2].price,
                        quantity: 2
                    }
                ],
                total: createdProducts[0].price + (createdProducts[2].price * 2),
                status: 'SHIPPED',
                carrier: 'FedEx',
                trackingNumber: 'FX123456789',
                estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
            });

            // Order 2 for demo user
            orders.push({
                customerId: demoUser._id,
                items: [
                    {
                        productId: createdProducts[1]._id, // Smart Fitness Watch
                        name: createdProducts[1].name,
                        price: createdProducts[1].price,
                        quantity: 1
                    }
                ],
                total: createdProducts[1].price,
                status: 'DELIVERED',
                carrier: 'UPS',
                trackingNumber: 'UPS987654321',
                estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            });

            // Order 3 for demo user
            orders.push({
                customerId: demoUser._id,
                items: [
                    {
                        productId: createdProducts[4]._id, // LED Desk Lamp
                        name: createdProducts[4].name,
                        price: createdProducts[4].price,
                        quantity: 1
                    },
                    {
                        productId: createdProducts[6]._id, // Wireless Phone Charger
                        name: createdProducts[6].name,
                        price: createdProducts[6].price,
                        quantity: 1
                    }
                ],
                total: createdProducts[4].price + createdProducts[6].price,
                status: 'PROCESSING'
            });
        }

        // Create orders for other customers
        for (let i = 0; i < Math.min(10, createdCustomers.length - 1); i++) {
            const customer = createdCustomers[i + 1]; // Skip demo user
            const numOrders = Math.floor(Math.random() * 3) + 1; // 1-3 orders per customer

            for (let j = 0; j < numOrders; j++) {
                const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
                const selectedProducts = [];
                let total = 0;

                for (let k = 0; k < numItems; k++) {
                    const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                    const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity

                    selectedProducts.push({
                        productId: product._id,
                        name: product.name,
                        price: product.price,
                        quantity
                    });

                    total += product.price * quantity;
                }

                const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                const order = {
                    customerId: customer._id,
                    items: selectedProducts,
                    total,
                    status,
                    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
                };

                if (status === 'SHIPPED' || status === 'DELIVERED') {
                    order.carrier = ['FedEx', 'UPS', 'USPS'][Math.floor(Math.random() * 3)];
                    order.trackingNumber = `${order.carrier}${Math.floor(Math.random() * 1000000000)}`;
                    order.estimatedDelivery = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000);
                }

                orders.push(order);
            }
        }

        // Insert orders
        const createdOrders = await Order.insertMany(orders);
        console.log(`✅ Created ${createdOrders.length} orders`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - ${createdCustomers.length} customers`);
        console.log(`   - ${createdProducts.length} products`);
        console.log(`   - ${createdOrders.length} orders`);
        console.log(`\n🔍 Test user: demo@example.com (has 3 orders)`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run seeding if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
