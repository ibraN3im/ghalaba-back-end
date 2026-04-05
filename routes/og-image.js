import express from 'express';
import sharp from 'sharp';

const router = express.Router();

// @route   GET /api/og-image
// @desc    Generate dynamic OG image for articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { title, image, lang = 'ar' } = req.query;
    
    if (!title || !image) {
      return res.status(400).json({ error: 'Title and image are required' });
    }

    // Create a canvas with the article image as background
    const imageBuffer = await fetch(image).then(res => res.buffer());
    
    // Create SVG overlay with newspaper branding and title
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0.7" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.9" />
          </linearGradient>
        </defs>
        
        <!-- Dark overlay at bottom -->
        <rect x="0" y="400" width="1200" height="230" fill="url(#overlay)" />
        
        <!-- Newspaper logo -->
        <rect x="40" y="450" width="80" height="80" rx="12" fill="#DC2626" />
        <text x="80" y="500" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">غ</text>
        
        <!-- Newspaper name -->
        <text x="140" y="480" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">
          ${lang === 'ar' ? 'صحيفة الغلابه' : 'Al-Ghalaba News'}
        </text>
        
        <!-- Article title -->
        <text x="40" y="530" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" max-width="1120">
          ${title.substring(0, 80)}${title.length > 80 ? '...' : ''}
        </text>
        
        <!-- Read more indicator -->
        <text x="40" y="580" font-family="Arial, sans-serif" font-size="18" fill="#E5E7EB">
          ${lang === 'ar' ? 'اقرأ المزيد' : 'Read More'} →
        </text>
      </svg>
    `;

    // Composite the image with SVG overlay
    const finalImage = await sharp(imageBuffer)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .composite([{ input: Buffer.from(svg), gravity: 'south' }])
      .png()
      .toBuffer();

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(finalImage);

  } catch (error) {
    console.error('Error generating OG image:', error);
    res.status(500).json({ error: 'Failed to generate OG image' });
  }
});

export default router;
