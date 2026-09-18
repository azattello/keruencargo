const Filial = require('../models/Filial');

const getFilialNameForUser = async (user) => {
  if (!user) return '';

  if (user.role === 'filial') {
    const filial = await Filial.findOne({ userId: user._id }).select('filialText filialName').lean();
    return String(filial?.filialText || filial?.filialName || user.selectedFilial || '').trim();
  }

  return String(user.selectedFilial || '').trim();
};

const getFilialArrivalStatusText = (filialName) => {
  const normalizedName = String(filialName || '').trim();
  return normalizedName ? `Прибыло в филиал ${normalizedName}` : '';
};

module.exports = {
  getFilialNameForUser,
  getFilialArrivalStatusText
};