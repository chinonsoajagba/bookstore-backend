require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'bookstore';

  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db(dbName);

    // Read seed data
    const seedDataPath = path.join(__dirname, 'data', 'lessons-seed.json');
    const lessonsData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    // Clear existing lessons collection
    await db.collection('lessons').deleteMany({});
    console.log('Cleared existing lessons collection');

    // Insert seed data
    const result = await db.collection('lessons').insertMany(lessonsData);
    console.log(`Inserted ${result.insertedCount} lessons into the database`);

    // Create indexes for search
    await db.collection('lessons').createIndex({ subject: 'text', location: 'text' });
    console.log('Created text index on subject and location fields');

    // Display inserted lessons
    const lessons = await db.collection('lessons').find({}).toArray();
    console.log('\nSeeded lessons:');
    lessons.forEach((lesson, i) => {
      console.log(`  ${i + 1}. ${lesson.subject} - ${lesson.location} - £${lesson.price} (${lesson.spaces} spaces)`);
    });

    console.log('\nDatabase seeded successfully!');
    console.log(`Database: ${dbName}`);
    console.log(`Collection: lessons`);
    console.log(`Total lessons: ${lessons.length}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

seedDatabase();
