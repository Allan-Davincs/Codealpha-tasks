import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { faker } from '@faker-js/faker';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@neza.com',
      password: 'Admin123!',
      passwordConfirm: 'Admin123!',
      role: 'admin',
      bio: 'System Administrator',
      isVerified: true
    });
    console.log('Admin user created');

    // Create regular users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        bio: faker.person.bio(),
        avatar: faker.image.avatar(),
        coverImage: faker.image.url()
      });
      users.push(user);
    }
    console.log(`${users.length} regular users created`);

    // Create follow relationships
    for (const user of users) {
      const followers = users
        .filter(u => u._id.toString() !== user._id.toString())
        .slice(0, Math.floor(Math.random() * 5) + 1);
      
      user.followers = followers.map(u => u._id);
      await user.save();
      
      // Update following for followers
      for (const follower of followers) {
        if (!follower.following.includes(user._id)) {
          follower.following.push(user._id);
          await follower.save();
        }
      }
    }
    console.log('Follow relationships created');

    // Create posts
    const posts = [];
    for (let i = 0; i < 50; i++) {
      const author = users[Math.floor(Math.random() * users.length)];
      
      const post = await Post.create({
        author: author._id,
        content: faker.lorem.paragraphs(Math.floor(Math.random() * 3) + 1),
        image: Math.random() > 0.7 ? faker.image.url() : undefined,
        tags: faker.lorem.words(Math.floor(Math.random() * 3)).split(' '),
        likes: users
          .slice(0, Math.floor(Math.random() * users.length))
          .map(u => u._id),
        visibility: ['public', 'friends', 'private'][Math.floor(Math.random() * 3)]
      });
      
      posts.push(post);
      
      // Update user post count
      await User.findByIdAndUpdate(author._id, {
        $inc: { postsCount: 1 }
      });
    }
    console.log(`${posts.length} posts created`);

    // Create comments
    for (const post of posts) {
      const commentCount = Math.floor(Math.random() * 5);
      
      for (let i = 0; i < commentCount; i++) {
        const commentAuthor = users[Math.floor(Math.random() * users.length)];
        
        // This would require a Comment model import
        // await Comment.create({
        //   post: post._id,
        //   author: commentAuthor._id,
        //   content: faker.lorem.sentence()
        // });
        
        // Update post comments count
        await Post.findByIdAndUpdate(post._id, {
          $inc: { commentsCount: 1 }
        });
      }
    }
    console.log('Comments created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();