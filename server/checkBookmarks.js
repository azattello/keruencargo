const mongoose = require('mongoose');
const config = require('config');
const User = require('./models/User');

async function checkUserBookmarks() {
  await mongoose.connect(config.get('dbUrl'));
  console.log('Connected to MongoDB');

  const user = await User.findById('69cc0d5ac4d1fb48827e820c');
  if (user) {
    console.log('User bookmarks:', user.bookmarks);
    console.log('Number of bookmarks:', user.bookmarks.length);
  } else {
    console.log('User not found');
  }

  await mongoose.disconnect();
}

checkUserBookmarks().catch(console.error);