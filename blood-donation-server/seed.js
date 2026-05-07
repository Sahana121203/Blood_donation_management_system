require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Inventory = require('./models/Inventory');
const DonationRequest = require('./models/DonationRequest');
const Appointment = require('./models/Appointment');
const DonationHistory = require('./models/DonationHistory');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Inventory.deleteMany({});
        await DonationRequest.deleteMany({});
        await Appointment.deleteMany({});
        await DonationHistory.deleteMany({});

        // Create admin user
        console.log('Creating admin user...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@blooddonation.com',
            password: adminPassword,
            role: 'admin',
            bloodType: 'O+',
            phone: '555-0100',
            address: '123 Admin St, New York, NY 10001',
            status: 'Active'
        });

        // Create sample users/donors
        console.log('Creating sample donors...');
        const userPassword = await bcrypt.hash('user123', 10);

        const donors = await User.create([
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: userPassword,
                role: 'user',
                bloodType: 'O+',
                phone: '555-0101',
                address: '123 Main St, New York, NY 10001',
                latitude: 40.7128,
                longitude: -74.0060,
                status: 'Active',
                lastDonation: new Date('2024-01-15')
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: userPassword,
                role: 'user',
                bloodType: 'A+',
                phone: '555-0102',
                address: '456 Park Ave, New York, NY 10022',
                latitude: 40.7580,
                longitude: -73.9855,
                status: 'Active',
                lastDonation: new Date('2024-02-20')
            },
            {
                name: 'Bob Johnson',
                email: 'bob@example.com',
                password: userPassword,
                role: 'user',
                bloodType: 'B+',
                phone: '555-0103',
                address: '789 Broadway, New York, NY 10003',
                latitude: 40.7282,
                longitude: -73.9942,
                status: 'Active',
                lastDonation: new Date('2023-12-10')
            },
            {
                name: 'Alice Brown',
                email: 'alice@example.com',
                password: userPassword,
                role: 'user',
                bloodType: 'O-',
                phone: '555-0104',
                address: '321 5th Ave, New York, NY 10016',
                latitude: 40.7484,
                longitude: -73.9857,
                status: 'Active',
                lastDonation: new Date('2024-01-05')
            },
            {
                name: 'Charlie Wilson',
                email: 'charlie@example.com',
                password: userPassword,
                role: 'user',
                bloodType: 'AB+',
                phone: '555-0105',
                address: '654 Madison Ave, New York, NY 10065',
                latitude: 40.7644,
                longitude: -73.9656,
                status: 'Active'
            }
        ]);

        // Create blood inventory
        console.log('Creating blood inventory...');
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const inventoryData = [
            { bloodType: 'A+', units: 25 },
            { bloodType: 'A-', units: 15 },
            { bloodType: 'B+', units: 30 },
            { bloodType: 'B-', units: 12 },
            { bloodType: 'AB+', units: 8 },
            { bloodType: 'AB-', units: 5 },
            { bloodType: 'O+', units: 45 },
            { bloodType: 'O-', units: 20 }
        ];
        await Inventory.create(inventoryData);

        // Create sample donation requests
        console.log('Creating sample donation requests...');
        await DonationRequest.create([
            {
                patientName: 'Patient A',
                bloodType: 'O+',
                units: 2,
                hospital: 'City Hospital',
                urgency: 'High',
                status: 'Pending'
            },
            {
                patientName: 'Patient B',
                bloodType: 'A+',
                units: 1,
                hospital: 'General Hospital',
                urgency: 'Medium',
                status: 'Pending'
            },
            {
                patientName: 'Patient C',
                bloodType: 'B-',
                units: 3,
                hospital: 'Memorial Hospital',
                urgency: 'High',
                status: 'Pending'
            }
        ]);

        // Create sample appointments
        console.log('Creating sample appointments...');
        await Appointment.create([
            {
                userId: donors[0]._id,
                date: '2024-03-15',
                time: '10:00',
                location: 'City Blood Center - Main Branch',
                status: 'Pending'
            },
            {
                userId: donors[1]._id,
                date: '2024-03-16',
                time: '14:00',
                location: 'City Blood Center - North Branch',
                status: 'Confirmed'
            }
        ]);

        // Create sample donation history
        console.log('Creating sample donation history...');
        await DonationHistory.create([
            {
                userId: donors[0]._id,
                date: '2024-01-15',
                location: 'City Blood Center - Main Branch',
                units: 1
            },
            {
                userId: donors[0]._id,
                date: '2023-09-10',
                location: 'City Blood Center - South Branch',
                units: 1
            },
            {
                userId: donors[1]._id,
                date: '2024-02-20',
                location: 'City Blood Center - North Branch',
                units: 1
            },
            {
                userId: donors[2]._id,
                date: '2023-12-10',
                location: 'City Blood Center - Main Branch',
                units: 1
            },
            {
                userId: donors[3]._id,
                date: '2024-01-05',
                location: 'Mobile Unit - Downtown',
                units: 1
            }
        ]);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Credentials:');
        console.log('─────────────────────────────────────');
        console.log('Admin:');
        console.log('  Email: admin@blooddonation.com');
        console.log('  Password: admin123');
        console.log('\nUser/Donor:');
        console.log('  Email: john@example.com');
        console.log('  Password: user123');
        console.log('─────────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
