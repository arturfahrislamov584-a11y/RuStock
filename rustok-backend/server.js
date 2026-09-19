import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'rustok_secret_key_2026_super_secure';
const DB_PATH = join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// ─── Database ────────────────────────────────────────

// ─── Pollinations POST helper ─────────────────────────
function pollinationsGenerate(prompt, imageBase64, width, height) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      prompt,
      width: width || 1024,
      height: height || 1024,
      model: 'flux',
      seed: String(Math.floor(Math.random() * 999999)),
      enhance: 'true',
      nologo: true,
      ...(imageBase64 ? { image: imageBase64 } : {}),
    });

    const req = https.request(
      'https://image.pollinations.ai/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        rejectUnauthorized: false,
        timeout: 90000,
      },
      (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          https.get(response.headers.location, { rejectUnauthorized: false, timeout: 90000 }, (res2) => {
            const chunks = [];
            res2.on('data', (c) => chunks.push(c));
            res2.on('end', () => resolve(Buffer.concat(chunks)));
          }).on('error', reject);
        } else {
          const chunks = [];
          response.on('data', (c) => chunks.push(c));
          response.on('end', () => resolve(Buffer.concat(chunks)));
        }
      }
    );
    req.on('error', reject);
    req.setTimeout(90000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

function loadDB() {
  if (!existsSync(DB_PATH)) {
    const initial = { users: [], downloads: [], favorites: [], generations: [] };
    writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function saveDB(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ─── Auth Middleware ──────────────────────────────────

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Нет токена' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Невалидный токен' });
  }
}

// ─── AUTH ROUTES ─────────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, inn } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль минимум 6 символов' });
  }

  const db = loadDB();
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email уже зарегистрирован' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password: hash,
    role: 'user',
    credits: 50,
    plan: 'starter',
    inn: inn || null,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  saveDB(db);

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
  const { password: _, ...safe } = user;

  res.json({ token, user: safe });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Введите email и пароль' });
  }

  const db = loadDB();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
  const { password: _, ...safe } = user;

  res.json({ token, user: safe });
});

app.get('/api/auth/me', auth, (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  const { password: _, ...safe } = user;
  res.json(safe);
});

// ─── PROFILE ROUTES ──────────────────────────────────

app.put('/api/profile', auth, (req, res) => {
  const db = loadDB();
  const idx = db.users.findIndex((u) => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Пользователь не найден' });

  const { name, email, inn } = req.body;
  if (name) db.users[idx].name = name;
  if (email) {
    const exists = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== req.userId
    );
    if (exists) return res.status(400).json({ error: 'Email уже занят' });
    db.users[idx].email = email;
  }
  if (inn !== undefined) db.users[idx].inn = inn;

  saveDB(db);
  const { password: _, ...safe } = db.users[idx];
  res.json(safe);
});

app.put('/api/profile/password', auth, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Заполните оба поля' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Новый пароль минимум 6 символов' });
  }

  const db = loadDB();
  const idx = db.users.findIndex((u) => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Пользователь не найден' });

  if (!bcrypt.compareSync(oldPassword, db.users[idx].password)) {
    return res.status(400).json({ error: 'Неверный текущий пароль' });
  }

  db.users[idx].password = bcrypt.hashSync(newPassword, 10);
  saveDB(db);

  res.json({ message: 'Пароль изменён' });
});

// ─── CREDITS ROUTES ──────────────────────────────────

app.get('/api/credits', auth, (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ credits: user.credits });
});

app.post('/api/credits/use', auth, (req, res) => {
  const { amount } = req.body;
  const db = loadDB();
  const idx = db.users.findIndex((u) => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Пользователь не найден' });

  if (db.users[idx].credits < amount) {
    return res.status(400).json({ error: 'Недостаточно кредитов' });
  }

  db.users[idx].credits -= amount;
  saveDB(db);
  res.json({ credits: db.users[idx].credits });
});

app.post('/api/credits/add', auth, (req, res) => {
  const { amount } = req.body;
  const db = loadDB();
  const idx = db.users.findIndex((u) => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Пользователь не найден' });

  db.users[idx].credits += amount;
  saveDB(db);
  res.json({ credits: db.users[idx].credits });
});

// ─── FAVORITES ROUTES ────────────────────────────────

app.get('/api/favorites', auth, (req, res) => {
  const db = loadDB();
  const favs = db.favorites.filter((f) => f.userId === req.userId);
  res.json(favs);
});

app.post('/api/favorites', auth, (req, res) => {
  const { imageId } = req.body;
  const db = loadDB();

  const exists = db.favorites.find(
    (f) => f.userId === req.userId && f.imageId === imageId
  );

  if (exists) {
    db.favorites = db.favorites.filter(
      (f) => !(f.userId === req.userId && f.imageId === imageId)
    );
    saveDB(db);
    return res.json({ favorited: false });
  }

  db.favorites.push({
    id: Date.now().toString(),
    userId: req.userId,
    imageId,
    createdAt: new Date().toISOString(),
  });
  saveDB(db);
  res.json({ favorited: true });
});

// ─── DOWNLOADS ROUTES ────────────────────────────────

app.get('/api/downloads', auth, (req, res) => {
  const db = loadDB();
  const downloads = db.downloads
    .filter((d) => d.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(downloads);
});

app.post('/api/downloads', auth, (req, res) => {
  const { imageId, title, thumbnail, credits } = req.body;
  const db = loadDB();

  db.downloads.push({
    id: Date.now().toString(),
    userId: req.userId,
    imageId,
    title,
    thumbnail,
    credits: credits || 0,
    createdAt: new Date().toISOString(),
  });
  saveDB(db);

  // списание кредитов
  const userIdx = db.users.findIndex((u) => u.id === req.userId);
  if (userIdx !== -1 && credits > 0) {
    db.users[userIdx].credits = Math.max(0, db.users[userIdx].credits - credits);
    saveDB(db);
  }

  res.json({ success: true, credits: db.users[userIdx]?.credits });
});

// ─── GENERATIONS ROUTES ──────────────────────────────

app.get('/api/generations', auth, (req, res) => {
  const db = loadDB();
  const gens = db.generations
    .filter((g) => g.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(gens);
});

app.post('/api/generations', auth, (req, res) => {
  const { prompt, model, url, credits } = req.body;
  const db = loadDB();

  db.generations.push({
    id: Date.now().toString(),
    userId: req.userId,
    prompt,
    model,
    url,
    credits: credits || 0,
    createdAt: new Date().toISOString(),
  });
  saveDB(db);

  const userIdx = db.users.findIndex((u) => u.id === req.userId);
  if (userIdx !== -1 && credits > 0) {
    db.users[userIdx].credits = Math.max(0, db.users[userIdx].credits - credits);
    saveDB(db);
  }

  res.json({ success: true, credits: db.users[userIdx]?.credits });
});

// ─── STATS (для админки) ─────────────────────────────

app.get('/api/stats', auth, (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  const userDownloads = db.downloads.filter((d) => d.userId === req.userId);
  const userFavs = db.favorites.filter((f) => f.userId === req.userId);
  const userGens = db.generations.filter((g) => g.userId === req.userId);

  res.json({
    credits: user.credits,
    plan: user.plan,
    downloads: userDownloads.length,
    favorites: userFavs.length,
    generations: userGens.length,
    totalSpent: userGens.reduce((s, g) => s + (g.credits || 0), 0) +
                userDownloads.reduce((s, d) => s + (d.credits || 0), 0),
  });
});

// ─── AUTHOR ROUTES ───────────────────────────────────

// Стать автором
app.post('/api/author/upgrade', auth, (req, res) => {
  const { portfolio, bio, specializations } = req.body;
  const db = loadDB();
  const idx = db.users.findIndex((u) => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Пользователь не найден' });

  db.users[idx].role = 'author';
  db.users[idx].authorProfile = {
    bio: bio || '',
    portfolio: portfolio || '',
    specializations: specializations || [],
    approved: true,
    totalEarnings: 0,
    totalSales: 0,
    joinedAt: new Date().toISOString(),
  };

  saveDB(db);
  const { password: _, ...safe } = db.users[idx];
  res.json(safe);
});

// Загрузка контента автором
app.post('/api/author/upload', auth, (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user || user.role !== 'author') {
    return res.status(403).json({ error: 'Только авторы могут загружать контент' });
  }

  const { title, description, tags, category, imageUrl, thumbnailUrl, width, height, format } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ error: 'Название и URL обязательны' });
  }

  const content = {
    id: Date.now().toString(),
    authorId: req.userId,
    authorName: user.name,
    title,
    description: description || '',
    tags: tags || [],
    category: category || 'abstract',
    imageUrl,
    thumbnailUrl: thumbnailUrl || imageUrl,
    width: width || 0,
    height: height || 0,
    format: format || 'JPEG',
    credits: 3,
    downloads: 0,
    views: 0,
    likes: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  if (!db.authorContent) db.authorContent = [];
  db.authorContent.push(content);
  saveDB(db);

  res.json(content);
});

// Все контент автора
app.get('/api/author/content', auth, (req, res) => {
  const db = loadDB();
  if (!db.authorContent) db.authorContent = [];
  const items = db.authorContent
    .filter((c) => c.authorId === req.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(items);
});

// Удаление контента
app.delete('/api/author/content/:id', auth, (req, res) => {
  const db = loadDB();
  if (!db.authorContent) db.authorContent = [];
  const idx = db.authorContent.findIndex(
    (c) => c.id === req.params.id && c.authorId === req.userId
  );
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });

  db.authorContent.splice(idx, 1);
  saveDB(db);
  res.json({ success: true });
});

// Статистика автора
app.get('/api/author/stats', auth, (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  if (!db.authorContent) db.authorContent = [];
  if (!db.authorSales) db.authorSales = [];

  const myContent = db.authorContent.filter((c) => c.authorId === req.userId);
  const mySales = db.authorSales.filter((s) => s.authorId === req.userId);

  const totalViews = myContent.reduce((s, c) => s + (c.views || 0), 0);
  const totalDownloads = myContent.reduce((s, c) => s + (c.downloads || 0), 0);
  const totalEarnings = mySales.reduce((s, c) => s + (c.amount || 0), 0);

  // Доход за последние 30 дней
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentSales = mySales.filter((s) => new Date(s.date) > thirtyDaysAgo);
  const recentEarnings = recentSales.reduce((s, c) => s + (c.amount || 0), 0);

  // Продажи по дням (последние 7)
  const dailySales = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().split('T')[0];
    const daySales = mySales.filter((s) => s.date && s.date.startsWith(dayStr));
    dailySales.push({
      date: dayStr,
      count: daySales.length,
      earnings: daySales.reduce((s, x) => s + (x.amount || 0), 0),
    });
  }

  res.json({
    totalContent: myContent.length,
    totalViews,
    totalDownloads,
    totalEarnings,
    recentEarnings,
    pendingPayout: Math.max(0, totalEarnings - (user.authorProfile?.paidOut || 0)),
    content: myContent,
    dailySales,
    recentSales: recentSales.slice(0, 20),
  });
});

// Получить весь публичный контент авторов (для каталога)
app.get('/api/author/all-content', (req, res) => {
  const db = loadDB();
  if (!db.authorContent) db.authorContent = [];
  const items = db.authorContent
    .filter((c) => c.status === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(items);
});

// ─── PIXABAY SEARCH PROXY ───────────────────────────

app.get('/api/pixabay/search', async (req, res) => {
  const { q, page, per_page, category, order } = req.query;

  const pageNum = parseInt(page) || 1;
  const limit = parseInt(per_page) || 20;
  const searchQuery = q || category || 'nature photo';
  const offset = (pageNum - 1) * limit;

  try {
    const data = await new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: searchQuery,
        gsrnamespace: '6',
        gsrlimit: String(limit),
        gsroffset: String(offset),
        prop: 'imageinfo',
        iiprop: 'url|size|user|mime|extmetadata',
        iiurlwidth: '800',
        format: 'json',
      });

      const request = https.get(
        `https://commons.wikimedia.org/w/api.php?${params}`,
        {
          headers: {
            'User-Agent': 'RusTok/1.0 (https://rustok.ai; contact@rustok.ai)',
            'Accept': 'application/json',
          },
          rejectUnauthorized: false,
        },
        (response) => {
          let body = '';
          response.on('data', (chunk) => body += chunk);
          response.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(new Error('Parse error'));
            }
          });
        }
      );
      request.on('error', reject);
      request.setTimeout(15000, () => { request.destroy(); reject(new Error('Timeout')); });
    });

    const pages = data.query?.pages || {};
    const items = Object.values(pages)
      .filter((p) => {
        const ii = p.imageinfo?.[0];
        return ii && ii.mime && ii.mime.startsWith('image/') && !ii.mime.includes('svg');
      })
      .map((p) => {
        const ii = p.imageinfo[0];
        const desc = ii.extmetadata?.ImageDescription?.value || '';
        const categories = ii.extmetadata?.Categories?.value || '';
        const tags = [
          ...(p.title || '').replace('File:', '').replace(/\.\w+$/, '').split(/[\s_]+/),
          ...categories.split('|').map(function(c) { return c.trim(); }),
        ].filter(Boolean).slice(0, 10);

        return {
          id: p.pageid,
          pageURL: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
          type: 'photo',
          tags: tags.join(', '),
          previewURL: ii.url,
          previewWidth: ii.thumbwidth || 400,
          previewHeight: ii.thumbheight || 300,
          webformatURL: ii.thumburl || ii.url,
          webformatWidth: ii.thumbwidth || 800,
          webformatHeight: ii.thumbheight || 600,
          largeImageURL: ii.url,
          imageWidth: ii.width,
          imageHeight: ii.height,
          imageSize: ii.size,
          views: 0,
          downloads: 0,
          likes: 0,
          comments: 0,
          user: ii.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, '') || 'Wikimedia',
          userImageURL: '',
        };
      });

    res.json({
      total: 10000,
      totalHits: 10000,
      hits: items,
    });
  } catch (err) {
    console.error('Search proxy error:', err.message);
    res.status(500).json({ error: 'Ошибка поиска: ' + err.message });
  }
});

// ─── VIDEO SEARCH PROXY ──────────────────────────────

app.get('/api/videos/search', async (req, res) => {
  const { q, page, per_page } = req.query;
  const limit = parseInt(per_page) || 20;
  const searchQuery = q || 'nature';

  const fetchJSON = (url) => new Promise((resolve) => {
    const request = https.get(url, {
      headers: { 'User-Agent': 'RusTok/1.0 (https://rustok.ai; contact@rustok.ai)' },
      rejectUnauthorized: false,
    }, (response) => {
      let body = '';
      response.on('data', (chunk) => body += chunk);
      response.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(null); } });
    });
    request.on('error', () => resolve(null));
    request.setTimeout(15000, () => { request.destroy(); resolve(null); });
  });

  try {
    let allTitles = [];

    // Search 1: query + "webm"
    const d1 = await fetchJSON(
      'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(searchQuery + ' webm') + '&srnamespace=6&srlimit=30&format=json'
    );
    if (d1 && d1.query && d1.query.search) {
      allTitles.push(...d1.query.search.map((r) => r.title));
    }

    // Search 2: query + "video"
    const d2 = await fetchJSON(
      'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(searchQuery + ' video') + '&srnamespace=6&srlimit=30&format=json'
    );
    if (d2 && d2.query && d2.query.search) {
      allTitles.push(...d2.query.search.map((r) => r.title));
    }

    // Filter to only video extensions
    const videoTitles = [...new Set(allTitles)].filter((t) => /\.(webm|ogv|mp4)$/i.test(t)).slice(0, limit);

    if (videoTitles.length === 0) {
      return res.json({ total: 0, totalHits: 0, hits: [] });
    }

    // Get details for video files
    const detailData = await fetchJSON(
      'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(videoTitles.join('|')) + '&prop=imageinfo&iiprop=url|size|user|mime|extmetadata&iiurlwidth=640&format=json'
    );

    const pages = (detailData && detailData.query && detailData.query.pages) || {};
    const items = Object.values(pages)
      .filter((p) => p.imageinfo && p.imageinfo[0])
      .map((p) => {
        const ii = p.imageinfo[0];
        const categories = (ii.extmetadata && ii.extmetadata.Categories && ii.extmetadata.Categories.value) || '';
        const tags = [
          ...(p.title || '').replace('File:', '').replace(/\.\w+$/, '').split(/[\s_]+/),
          ...categories.split('|').map(function(c) { return c.trim(); }),
        ].filter(Boolean).slice(0, 10);

        return {
          id: p.pageid || p.title,
          pageURL: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(p.title),
          type: 'video',
          tags: tags.join(', '),
          picture_id: p.pageid || p.title,
          videos: {
            small: { url: ii.url, width: 320, height: 180, size: 0, thumbnail: ii.thumburl || ii.url },
            medium: { url: ii.url, width: 640, height: 360, size: 0, thumbnail: ii.thumburl || ii.url },
            large: { url: ii.url, width: ii.width || 1280, height: ii.height || 720, size: ii.size || 0, thumbnail: ii.thumburl || ii.url },
          },
          duration: 0,
          views: 0,
          downloads: 0,
          likes: 0,
          user: (ii.extmetadata && ii.extmetadata.Artist && ii.extmetadata.Artist.value || '').replace(/<[^>]*>/g, '') || 'Wikimedia',
          userImageURL: '',
        };
      });

    res.json({ total: items.length, totalHits: items.length, hits: items });
  } catch (err) {
    console.error('Video search error:', err.message);
    res.status(500).json({ error: 'Ошибка поиска видео: ' + err.message });
  }
});
// ─── AI TOOLS ────────────────────────────────────────

app.post('/api/tools/background-remove', auth, async (req, res) => {
  try {
    const db = loadDB();
    const user = db.users.find((u) => u.id === req.userId);
    if (!user || user.credits < 2) return res.status(400).json({ error: 'Недостаточно кредитов (нужно 2)' });

    const { imageUrl, background } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl обязателен' });

    let imageBase64 = null;
    if (imageUrl.startsWith('data:image')) {
      imageBase64 = imageUrl;
    }

    const prompt = imageBase64
      ? `Place this exact product on a ${background || 'clean white studio'} background, professional product photography, centered, high quality, preserve original product exactly`
      : `Place this product on a ${background || 'clean white studio'} background, professional product photography, centered, high quality`;

    const imageBuffer = await pollinationsGenerate(prompt, imageBase64, 1024, 1024);

    user.credits -= 2;
    saveDB(db);

    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Background tool error:', err.message);
    res.status(500).json({ error: 'Ошибка: ' + err.message });
  }
});

app.post('/api/tools/infographic', auth, async (req, res) => {
  try {
    const db = loadDB();
    const user = db.users.find((u) => u.id === req.userId);
    if (!user || user.credits < 3) return res.status(400).json({ error: 'Недостаточно кредитов (нужно 3)' });

    const { prompt, imageBase64, width, height } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt обязателен' });

    let image = imageBase64 || null;
    if (!image && prompt.startsWith('data:image')) {
      image = prompt;
    }

    const fullPrompt = image
      ? `Create a professional infographic based on this product image. ${prompt}, professional infographic design, clean modern layout, bold text areas, product showcase, commercial quality`
      : `${prompt}, professional infographic design, clean modern layout, bold text areas, product showcase, commercial quality`;

    const imageBuffer = await pollinationsGenerate(fullPrompt, image, width || 1024, height || 1024);

    user.credits -= 3;
    saveDB(db);

    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Infographic tool error:', err.message);
    res.status(500).json({ error: 'Ошибка: ' + err.message });
  }
});

app.post('/api/tools/magic-resize', auth, async (req, res) => {
  try {
    const db = loadDB();
    const user = db.users.find((u) => u.id === req.userId);
    if (!user || user.credits < 2) return res.status(400).json({ error: 'Недостаточно кредитов (нужно 2)' });

    const { prompt, imageBase64, targetWidth, targetHeight } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt обязателен' });

    let image = imageBase64 || null;
    if (!image && prompt.startsWith('data:image')) {
      image = prompt;
    }

    const fullPrompt = image
      ? `Seamlessly extend and outpaint this image. ${prompt}, seamless outpainting extension, consistent style, professional quality, photorealistic`
      : `${prompt}, seamless outpainting extension, consistent style, professional quality, photorealistic`;

    const imageBuffer = await pollinationsGenerate(fullPrompt, image, targetWidth || 1024, targetHeight || 1792);

    user.credits -= 2;
    saveDB(db);

    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Magic resize error:', err.message);
    res.status(500).json({ error: 'Ошибка: ' + err.message });
  }
});

app.post('/api/tools/batch-background', auth, async (req, res) => {
  try {
    const db = loadDB();
    const user = db.users.find((u) => u.id === req.userId);
    if (!user) return res.status(400).json({ error: 'Пользователь не найден' });

    const { imageUrls, background } = req.body;
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ error: 'imageUrls обязателен' });
    }
    if (imageUrls.length > 30) return res.status(400).json({ error: 'Максимум 30 изображений' });

    const costPerImage = 2;
    const totalCost = imageUrls.length * costPerImage;
    if (user.credits < totalCost) {
      return res.status(400).json({ error: `Недостаточно кредитов (нужно ${totalCost})` });
    }

    const bgDesc = background || 'clean white studio background';
    const results = [];

    for (const url of imageUrls) {
      try {
        const prompt = `Place this product on a ${bgDesc}, professional product photography, consistent style, centered, high quality`;
        const params = new URLSearchParams({
          prompt,
          width: '1024',
          height: '1024',
          model: 'flux',
          seed: String(Math.floor(Math.random() * 999999)),
          enhance: 'true',
        });

        const imageBuffer = await new Promise((resolve, reject) => {
          const req2 = https.get(
            `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`,
            { rejectUnauthorized: false, timeout: 60000 },
            (response) => {
              if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                https.get(response.headers.location, { rejectUnauthorized: false, timeout: 60000 }, (res2) => {
                  const chunks = [];
                  res2.on('data', (c) => chunks.push(c));
                  res2.on('end', () => resolve(Buffer.concat(chunks)));
                }).on('error', reject);
              } else {
                const chunks = [];
                response.on('data', (c) => chunks.push(c));
                response.on('end', () => resolve(Buffer.concat(chunks)));
              }
            }
          );
          req2.on('error', reject);
          req2.setTimeout(60000, () => { req2.destroy(); reject(new Error('Timeout')); });
        });

        const base64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
        results.push({ original: url, processed: base64 });
      } catch {
        results.push({ original: url, processed: null, error: 'Ошибка обработки' });
      }
    }

    user.credits -= totalCost;
    saveDB(db);

    res.json({ results, creditsUsed: totalCost, creditsLeft: user.credits });
  } catch (err) {
    console.error('Batch background error:', err.message);
    res.status(500).json({ error: 'Ошибка: ' + err.message });
  }
});

// ─── AI GENERATION PROXY ─────────────────────────────

app.get('/api/generate/image', auth, async (req, res) => {
  const { prompt, width, height, model, seed, enhance } = req.query;

  if (!prompt) return res.status(400).json({ error: 'prompt обязателен' });

  const params = new URLSearchParams({
    prompt,
    width: width || '1024',
    height: height || '1024',
    model: model || 'flux',
    seed: seed || String(Math.floor(Math.random() * 999999)),
    enhance: enhance || 'true',
    nologo: 'true',
  });

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString().replace(/^[^?]*\?/, '')}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RusTok/1.0' },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({ error: 'Ошибка генерации' });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Generation error:', err.message);
    res.status(500).json({ error: 'Ошибка генерации: ' + err.message });
  }
});

// ─── Start ───────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 РуСток API сервер: http://localhost:${PORT}`);
  console.log(`📋 API:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/profile`);
  console.log(`   PUT  /api/profile`);
  console.log(`   PUT  /api/profile/password`);
  console.log(`   GET  /api/credits`);
  console.log(`   POST /api/credits/use`);
  console.log(`   GET  /api/favorites`);
  console.log(`   POST /api/favorites`);
  console.log(`   GET  /api/downloads`);
  console.log(`   POST /api/downloads`);
  console.log(`   GET  /api/stats`);
});
