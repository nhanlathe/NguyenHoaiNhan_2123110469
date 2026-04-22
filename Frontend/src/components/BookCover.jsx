import { useRef, useEffect } from 'react';

const CATEGORY_THEMES = {
  'Giáo khoa': { bg: '#1a5276', accent: '#2980b9', icon: '📐' },
  'Văn học': { bg: '#6b2737', accent: '#a93226', icon: '📖' },
  'Kinh tế': { bg: '#1c2833', accent: '#d4ac0d', icon: '💹' },
  'Ngoại văn': { bg: '#0e4d45', accent: '#1abc9c', icon: '🌍' },
  'Văn học cổ điển': { bg: '#4a235a', accent: '#8e44ad', icon: '📜' },
  'Bút': { bg: '#2c3e50', accent: '#3498db', icon: '✏️' },
  'Tập vở': { bg: '#27ae60', accent: '#2ecc71', icon: '📓' },
  'Dụng cụ vẽ': { bg: '#e67e22', accent: '#f39c12', icon: '🎨' },
  'Gấu bông': { bg: '#e74c3c', accent: '#f1948a', icon: '🧸' },
  'Boardgame': { bg: '#8e44ad', accent: '#bb8fce', icon: '🎲' },
};

const DEFAULT_THEME = { bg: '#5d4e37', accent: '#8b7355', icon: '📦' };

function hashCode(str) {
  if (!str) return 0;
  const s = String(str);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

export default function BookCover({ name, category, author, size = 40 }) {
  const safeName = String(name || 'Sản phẩm');
  const safeCategory = String(category || 'Khác');
  const safeAuthor = author ? String(author) : '';
  const canvasRef = useRef(null);
  const theme = CATEGORY_THEMES[safeCategory] || DEFAULT_THEME;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const scale = 4; // Higher resolution
    const w = size * scale;
    const h = size * 1.4 * scale;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 1.4}px`;
    
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, theme.bg);
    grad.addColorStop(1, adjustColor(theme.bg, 30));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    
    // Decorative accent stripe at top
    ctx.fillStyle = theme.accent;
    ctx.fillRect(0, 0, w, 6 * scale);
    
    // Spine effect (left edge)
    ctx.fillStyle = adjustColor(theme.bg, -20);
    ctx.fillRect(0, 0, 3 * scale, h);
    
    // Decorative pattern based on hash
    const hash = Math.abs(hashCode(safeName));
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      const x = ((hash >> (i * 4)) & 0xF) / 16 * w;
      const y = ((hash >> (i * 4 + 2)) & 0xF) / 16 * h;
      const r = (10 + Math.abs((hash >> i) % 20)) * scale;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Bottom accent band
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, h - 12 * scale, w, 12 * scale);
    ctx.globalAlpha = 1;
    
    // Title text
    const fontSize = Math.max(4, Math.min(8, 48 / Math.max(safeName.length, 1))) * scale;
    ctx.font = `bold ${fontSize}px "Playfair Display", serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Word wrap
    const words = safeName.split(' ');
    const maxWidth = w - 10 * scale;
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    const lineHeight = fontSize * 1.3;
    const startY = h * 0.35 - (lines.length * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, startY + i * lineHeight);
    });
    
    // Author name (if provided)
    if (safeAuthor) {
      const authorFontSize = 4 * scale;
      ctx.font = `italic ${authorFontSize}px serif`;
      ctx.fillStyle = '#ffffff';
      
      // Handle long author names
      const maxAuthorWidth = w - 10 * scale;
      let displayAuthor = safeAuthor;
      if (ctx.measureText(displayAuthor).width > maxAuthorWidth) {
        displayAuthor = displayAuthor.substring(0, 15) + '...';
      }
      ctx.fillText(displayAuthor, w / 2, h - 9 * scale);
    }

    // Category label at bottom
    const catFontSize = 3.5 * scale;
    ctx.font = `${catFontSize}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(safeCategory, w / 2, h - 3.5 * scale);
    
  }, [safeName, safeCategory, safeAuthor, size, theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        borderRadius: '4px',
        display: 'block',
        boxShadow: '1px 1px 3px rgba(0,0,0,0.2)',
      }}
    />
  );
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `rgb(${r},${g},${b})`;
}
