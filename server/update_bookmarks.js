const mongoose = require('mongoose');
const User = require('./models/User');

const normalize = (s = '') => String(s).replace(/\s+/g, '').toUpperCase();

async function updateBookmarks() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nomadcargo', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to DB');

    const users = await User.find({ 'bookmarks.trackNormalized': { $exists: false } }).lean();
    console.log(`Found ${users.length} users with bookmarks without trackNormalized`);

    for (const user of users) {
      const updatedBookmarks = user.bookmarks.map(bookmark => {
        if (!bookmark.trackNormalized && bookmark.trackNumber) {
          bookmark.trackNormalized = normalize(bookmark.trackNumber);
          console.log(`Updated bookmark ${bookmark.trackNumber} to ${bookmark.trackNormalized}`);
        }
        return bookmark;
      });

      await User.updateOne({ _id: user._id }, { bookmarks: updatedBookmarks });
    }

    console.log('Update complete');
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

updateBookmarks();