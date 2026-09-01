const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Course = require('../models/Course');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

const coursesDir = path.join(__dirname, '..', 'uploads', 'courses');
if (!fs.existsSync(coursesDir)) {
  fs.mkdirSync(coursesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, coursesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '.jpg');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Поддерживаются только JPG, PNG, WEBP изображения'));
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return res.json({ courses });
  } catch (error) {
    console.error('Ошибка получения курсов:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, youtubeUrl, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Название курса обязательно' });
    }

    if (!youtubeUrl || !youtubeUrl.trim()) {
      return res.status(400).json({ message: 'Ссылка на YouTube обязательна' });
    }

    const course = new Course({
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      description: description || '',
      image: req.file ? `/uploads/courses/${req.file.filename}` : '',
      createdBy: req.user?.id || null
    });

    await course.save();
    return res.status(201).json({ message: 'Курс создан', course });
  } catch (error) {
    console.error('Ошибка создания курса:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.put('/:id', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Курс не найден' });
    }

    const { title, youtubeUrl, description } = req.body;
    if (title !== undefined) course.title = title.trim();
    if (youtubeUrl !== undefined) course.youtubeUrl = youtubeUrl.trim();
    if (description !== undefined) course.description = description || '';

    if (req.file) {
      if (course.image) {
        const oldFile = path.join(__dirname, '..', course.image.replace(/^\//, ''));
        if (fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      }
      course.image = `/uploads/courses/${req.file.filename}`;
    }

    course.updatedAt = new Date();
    await course.save();

    return res.json({ message: 'Курс обновлен', course });
  } catch (error) {
    console.error('Ошибка обновления курса:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Курс не найден' });
    }

    if (course.image) {
      const filePath = path.join(__dirname, '..', course.image.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Course.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Курс удалён' });
  } catch (error) {
    console.error('Ошибка удаления курса:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
