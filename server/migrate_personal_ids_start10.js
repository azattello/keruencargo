const mongoose = require('mongoose');
const User = require('./models/User');
const Filial = require('./models/Filial');

const normalizePersonalId = (personalId) => String(personalId).trim();

const run = async () => {
  await mongoose.connect('mongodb://localhost:27017/nomadcargo');
  console.log('Connected to DB');

  const filials = await Filial.find().lean();

  for (const filial of filials) {
    const filialId = filial.filialId;
    if (!filialId) continue;

    // Сначала соберем занятые номера (в том числе > 10)
    const users = await User.find({ selectedFilial: filial.filialText, personalId: { $regex: `^${filialId}-` } }).lean();
    const used = new Set();

    users.forEach(user => {
      const match = String(user.personalId).match(new RegExp(`^${filialId}-(\\d+)$`));
      if (match && match[1]) {
        used.add(parseInt(match[1], 10));
      }
    });

    // Определяем следующее свободное число >= 10
    const getNextFree = () => {
      let n = 10;
      while (used.has(n)) n += 1;
      return n;
    };

    // Перенумеруем пользователей, у которых suffix < 10
    const toFix = users
      .filter(u => {
        const match = String(u.personalId).match(new RegExp(`^${filialId}-(\\d+)$`));
        return match && parseInt(match[1], 10) < 10;
      })
      .sort((a, b) => a.createdAt - b.createdAt); // старые сначала

    for (const user of toFix) {
      const next = getNextFree();
      const newId = `${filialId}-${String(next).padStart(2, '0')}`;
      console.log(`Updating ${user.personalId} -> ${newId} for user ${user._id}`);
      await User.updateOne({ _id: user._id }, { personalId: newId });
      used.add(next);
    }
  }

  console.log('Migration complete');
  await mongoose.disconnect();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});