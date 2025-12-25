import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// In-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > userData.resetTime) {
    userData.count = 1;
    userData.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    userData.count++;
  }
  
  rateLimitMap.set(ip, userData);
  
  if (userData.count > MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remainingTime: userData.resetTime - now };
  }
  return { allowed: true, remainingTime: 0 };
}

// Image generation endpoint
app.post('/api/generate', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const rateLimit = checkRateLimit(ip);
  
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please wait ${Math.ceil(rateLimit.remainingTime / 1000)} seconds.`,
      retryAfter: rateLimit.remainingTime
    });
  }

  const { prompt, model, width, height, numImages, apiKey } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const finalApiKey = apiKey || process.env.OPENROUTER_API_KEY;
  if (!finalApiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  try {
    // Use OpenRouter API
    const openRouterApiKey = apiKey || process.env.OPENROUTER_API_KEY;
    
    // Map model names
    const modelMap = {
      'dalle3': 'openai/dall-e-3',
      'dalle2': 'openai/dall-e-2',
      'flux2-pro': 'black-forest-labs/flux.2-pro',
      'stable-diffusion': 'stabilityai/stable-diffusion-xl-v1.0'
    };

    const selectedModel = modelMap[model] || modelMap['flux2-pro'];
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'BildGenerator'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text'],
        n: numImages || 1,
        // Some models might use these for size, others might ignore
        size: `${width || 1024}x${height || 1024}`
      })
    });

    let data;
    try {
      const responseText = await response.text();
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      throw new Error(`Invalid API response`);
    }

    if (!response.ok) {
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    // Download and save images
    const savedImages = [];
    const timestamp = Date.now();
    
    // OpenRouter Chat Completions format for images
    const imagesToProcess = [];
    
    if (data.choices && data.choices[0]?.message?.images) {
      // OpenRouter multimodal format
      data.choices[0].message.images.forEach(img => {
        imagesToProcess.push({ url: img.image_url?.url || img.url });
      });
    } else if (data.data && Array.isArray(data.data)) {
      // Fallback to OpenAI format if some provider returns it
      data.data.forEach(img => {
        imagesToProcess.push({ url: img.url || img.b64_json });
      });
    }

    for (let i = 0; i < imagesToProcess.length; i++) {
      const imageData = imagesToProcess[i];
      const imageUrl = imageData.url;
      
      if (!imageUrl) continue;

      let imageBuffer;
      let filename;
      
      if (imageUrl.startsWith('data:image')) {
        // Base64 image
        const base64Data = imageUrl.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
        filename = `image_${timestamp}_${i + 1}.png`;
      } else {
        // URL - fetch the image
        try {
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }
          const arrayBuffer = await imageResponse.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          filename = `image_${timestamp}_${i + 1}.png`;
        } catch (err) {
          console.error('Failed to fetch image URL:', imageUrl);
          continue;
        }
      }

      if (imageBuffer) {
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, imageBuffer);
        
        savedImages.push({
          filename,
          url: `/uploads/${filename}`,
          prompt,
          model: selectedModel,
          timestamp,
          width: width || 1024,
          height: height || 1024
        });
      }
    }

    res.json({
      success: true,
      images: savedImages,
      usage: data.usage
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      error: 'Generation failed',
      message: error.message
    });
  }
});

// Get list of generated images
app.get('/api/images', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const images = files
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
      .map(file => {
        const filepath = path.join(uploadsDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          url: `/uploads/${file}`,
          timestamp: stats.mtimeMs,
          size: stats.size
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50); // Last 50 images

    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Get image metadata
app.get('/api/images/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(uploadsDir, filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  res.sendFile(filepath);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
