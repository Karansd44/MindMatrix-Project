package com.kumbar.karn.ui.util

import android.content.Context
import android.graphics.*
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import androidx.core.graphics.ColorUtils
import com.kumbar.karn.data.model.Product
import com.kumbar.karn.data.model.User

/**
 * BenefitCardEngine: Lead Architect Implementation
 * Programmatically generates high-end "Digital Story Cards" for artisans.
 * Focuses on blending traditional craft with modern health science overlays.
 */
object BenefitCardEngine {

    private const val CARD_WIDTH = 1080
    private const val CARD_HEIGHT = 1350 // 4:5 optimized for social sharing

    fun generateBenefitCard(
        context: Context,
        product: Product,
        artisan: User,
        productBitmap: Bitmap
    ): Bitmap {
        val output = Bitmap.createBitmap(CARD_WIDTH, CARD_HEIGHT, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(output)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        // 1. Draw Background / Base Image
        val scale = Math.max(
            CARD_WIDTH.toFloat() / productBitmap.width,
            CARD_HEIGHT.toFloat() / productBitmap.height
        )
        val scaledWidth = productBitmap.width * scale
        val scaledHeight = productBitmap.height * scale
        val left = (CARD_WIDTH - scaledWidth) / 2
        val top = (CARD_HEIGHT - scaledHeight) / 2
        canvas.drawBitmap(productBitmap, null, RectF(left, top, left + scaledWidth, top + scaledHeight), paint)

        // 2. Apply "Editorial" Gradient Overlay
        // android.graphics.Color uses Ints. Using Color.argb for transparency.
        val transparent = Color.argb(0, 0, 0, 0)
        val black85 = Color.argb((255 * 0.85).toInt(), 0, 0, 0)
        
        val gradient = LinearGradient(
            0f, CARD_HEIGHT * 0.5f, 0f, CARD_HEIGHT.toFloat(),
            intArrayOf(transparent, black85),
            null, Shader.TileMode.CLAMP
        )
        val gradientPaint = Paint().apply {
            shader = gradient
        }
        canvas.drawRect(0f, CARD_HEIGHT * 0.4f, CARD_WIDTH.toFloat(), CARD_HEIGHT.toFloat(), gradientPaint)

        // 3. Define Typography
        val titlePaint = TextPaint().apply {
            color = Color.WHITE
            textSize = 64f
            typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
            isAntiAlias = true
        }

        val heritageGold = Color.rgb(212, 175, 55) // #D4AF37

        val benefitPaint = TextPaint().apply {
            color = heritageGold
            textSize = 42f
            typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            isAntiAlias = true
        }

        val white90 = Color.argb((255 * 0.9).toInt(), 255, 255, 255)
        val brandingPaint = TextPaint().apply {
            color = white90
            textSize = 32f
            typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
            isAntiAlias = true
            letterSpacing = 0.1f
        }

        // 4. Benefit Logic Mapping
        val healthBenefit = when (product.name.lowercase()) {
            "curd pot" -> "Maintains pH balance and adds natural minerals for better digestion."
            "water bottle" -> "Natural cooling via micro-porosity; 100% BPA and lead-free."
            "cooking handi" -> "Circulates steam to retain 100% of food nutrients and natural flavor."
            else -> product.benefit.ifEmpty { "Traditional handcrafted clay, supporting natural wellness." }
        }

        // 5. Draw Text Content
        val margin = 80f
        var currentY = CARD_HEIGHT - 120f

        val brandingText = "Artisan: ${artisan.name} · ${artisan.village ?: "Legacy Potter"}"
        canvas.drawText(brandingText.uppercase(), margin, currentY, brandingPaint)
        
        currentY -= 60f
        
        val benefitWidth = CARD_WIDTH - (margin * 2).toInt()
        val benefitLayout = StaticLayout.Builder.obtain(healthBenefit, 0, healthBenefit.length, benefitPaint, benefitWidth)
            .setAlignment(Layout.Alignment.ALIGN_NORMAL)
            .setMaxLines(3)
            .build()
        
        canvas.save()
        canvas.translate(margin, currentY - benefitLayout.height)
        benefitLayout.draw(canvas)
        canvas.restore()
        
        currentY -= (benefitLayout.height + 40f)

        canvas.drawText(product.name.uppercase(), margin, currentY, titlePaint)

        // 6. Draw Gold Accent Line
        val accentPaint = Paint().apply {
            color = heritageGold
            strokeWidth = 6f
        }
        canvas.drawLine(margin, currentY + 20f, margin + 120f, currentY + 20f, accentPaint)

        return output
    }
}
