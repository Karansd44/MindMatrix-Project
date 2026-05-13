/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CardState, Language } from '../types';
import { UI_STRINGS } from '../constants/products';

export class BenefitCardEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number = 1080, height: number = 1350) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
  }

  async generate(state: CardState): Promise<string> {
    const { product, artisan, textColor, strokeColor = 'rgba(0, 0, 0, 0.4)', strokeWidth = 1.5, template } = state;
    
    // Ensure fonts are loaded
    await document.fonts.ready;
    
    // 1. Load and draw base image
    const img = await this.loadImage(product.imageUrl);
    this.drawCoverImage(img);

    // 2. Apply Template Specific Overlays
    if (template === 'traditional') {
      this.drawTraditionalBorder();
    } else if (template === 'festival') {
      this.drawFestivalElements();
    }

    // 3. Overlay gradient
    this.drawTextOverlayGradient();
    this.drawTextPanel();

    // Configure text shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    this.ctx.shadowBlur = 12;
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 3;

    // 4. Draw Product Info
    this.ctx.fillStyle = textColor;
    
    // Product Name
    this.ctx.font = 'bold 76px "Space Grotesk", sans-serif'; 
    this.wrapText(product.name.toUpperCase(), 60, this.canvas.height - 410, this.canvas.width - 120, 86);
    
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = strokeWidth;
    this.wrapTextStroke(product.name.toUpperCase(), 60, this.canvas.height - 410, this.canvas.width - 120, 86);

    // Health Benefit Badge
    this.drawBenefitBadge(60, this.canvas.height - 310, product.benefit);

    // 5. Draw Artisan Branding
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.drawArtisanBranding(60, this.canvas.height - 90, artisan);

    // 6. Draw QR Code Placeholder (Mock)
    this.drawQRCode(this.canvas.width - 200, this.canvas.height - 330, state.language);

    // 7. Eco Impact Score
    this.drawEcoScore(this.canvas.width - 200, 60, product.ecoScore);

    // 8. Heritage Stamp
    this.drawHeritageStamp(60, 60);

    return this.canvas.toDataURL('image/jpeg', 0.95);
  }

  private drawBenefitBadge(x: number, y: number, text: string) {
    this.ctx.save();
    this.ctx.font = 'italic 42px "Inter", sans-serif';
    const maxWidth = this.canvas.width - 180;
    const boxHeight = 160;

    this.ctx.fillStyle = 'rgba(26, 26, 26, 0.42)';
    this.roundRect(x - 20, y - 58, maxWidth + 40, boxHeight, 28);
    this.ctx.fill();

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    this.roundRect(x - 20, y - 58, maxWidth + 40, boxHeight, 28);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '600 20px "Inter", sans-serif';
    this.ctx.fillText('BENEFIT CARD', x, y - 18);
    this.ctx.font = 'italic 44px "Inter", sans-serif';
    this.wrapText(`" ${text} "`, x, y + 30, maxWidth, 54);
    this.ctx.restore();
  }

  private drawArtisanBranding(x: number, y: number, artisan: any) {
    this.ctx.save();
    
    // Circle Avatar background
    this.ctx.fillStyle = '#8D6E3E';
    this.ctx.beginPath();
    this.ctx.arc(x + 40, y, 40, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 34px "Inter", sans-serif';
    this.ctx.fillText(artisan.name, x + 100, y - 5);
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.font = '600 22px "Inter", sans-serif';
    this.wrapText(`${artisan.village} • ${artisan.phone}`, x + 100, y + 30, this.canvas.width - (x + 160), 26);
    
    this.ctx.restore();
  }

  private drawEcoScore(x: number, y: number, score: number) {
    this.ctx.save();
    const size = 140;
    
    // Circle background
    this.ctx.fillStyle = 'rgba(46, 125, 50, 0.9)'; // Forest green
    this.ctx.beginPath();
    this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 42px "Space Grotesk", sans-serif';
    this.ctx.fillText(`${score}%`, x + size/2, y + size/2 + 5);
    
    this.ctx.font = 'black 14px "Inter", sans-serif';
    this.ctx.fillText('ECO IMPACT', x + size/2, y + size/2 + 35);
    
    this.ctx.restore();
  }

  private drawHeritageStamp(x: number, y: number) {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(x, y, 220, 100);
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = 'bold 22px "Inter", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('KUMBARA-KALA', x + 110, y + 45);
    this.ctx.font = '600 16px "Inter", sans-serif';
    this.ctx.fillText('HANDCRAFTED LEGACY', x + 110, y + 75);
    this.ctx.restore();
  }

  private drawQRCode(x: number, y: number, lang: Language = 'en') {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, 140, 140, 20);
    this.ctx.fill();
    
    // Mock QR pattern
    this.ctx.fillStyle = '#1A1A1A';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if ((i + j) % 2 === 0) {
          this.ctx.fillRect(x + 20 + i * 25, y + 20 + j * 25, 20, 20);
        }
      }
    }
    this.ctx.font = 'bold 12px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(UI_STRINGS[lang].scanStory, x + 70, y + 130);
    this.ctx.restore();
  }

  private drawTraditionalBorder() {
    this.ctx.strokeStyle = 'rgba(141, 110, 99, 0.5)';
    this.ctx.lineWidth = 40;
    this.ctx.strokeRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);
  }

  private drawFestivalElements() {
    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'; // Gold tint
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 300, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawCoverImage(img: HTMLImageElement) {
    const canvasRatio = this.canvas.width / this.canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawHeight = this.canvas.height;
      drawWidth = img.width * (this.canvas.height / img.height);
      offsetX = (this.canvas.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = this.canvas.width;
      drawHeight = img.height * (this.canvas.width / img.width);
      offsetX = 0;
      offsetY = (this.canvas.height - drawHeight) / 2;
    }

    this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  private drawTextOverlayGradient() {
    const gradientHeight = 800; // Taller gradient for smoother falloff
    const gradient = this.ctx.createLinearGradient(0, this.canvas.height - gradientHeight, 0, this.canvas.height);
    
    // Smoother cubic-like transition for the scrim effect
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.35)');
    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.65)');
    gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.88)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.98)'); // Near solid black at the base
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, this.canvas.height - gradientHeight, this.canvas.width, gradientHeight);
  }

  private drawTextPanel() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    this.roundRect(30, this.canvas.height - 510, this.canvas.width - 60, 460, 36);
    this.ctx.fill();
    this.ctx.restore();
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = this.ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        this.ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, y);
  }

  private wrapTextStroke(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let cursorY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = this.ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        this.ctx.strokeText(line.trim(), x, cursorY);
        line = words[n] + ' ';
        cursorY += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.strokeText(line.trim(), x, cursorY);
  }

  private roundRect(x: number, y: number, width: number, height: number, radius: number) {
    const r = Math.min(radius, width / 2, height / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + width - r, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this.ctx.lineTo(x + width, y + height - r);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this.ctx.lineTo(x + r, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}
