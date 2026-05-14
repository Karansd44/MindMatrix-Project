package com.kumbar.karn.ui.util

import android.content.Context
import android.graphics.*
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import com.kumbar.karn.data.model.Product
import com.kumbar.karn.data.model.User

object StoryCardGenerator {

    fun generateCard(
        context: Context,
        product: Product,
        artisan: User,
        story: String,
        productBitmap: Bitmap?
    ): Bitmap {
        val width = 1080
        val height = 1350 // 4:5 Aspect Ratio for Social Media
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // 1. Background (Earth Tones)
        val bgPaint = Paint().apply {
            color = 0xFFFFDBAC.toInt() // EarthBackground
        }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        // 2. Product Image Placeholder or Actual
        val imageRect = RectF(50f, 50f, width - 50f, 600f)
        if (productBitmap != null) {
            canvas.drawBitmap(productBitmap, null, imageRect, null)
        } else {
            val placeholderPaint = Paint().apply { color = 0xFFC68642.toInt() }
            canvas.drawRect(imageRect, placeholderPaint)
        }

        // 3. Text Styling
        val titlePaint = TextPaint().apply {
            color = 0xFF3E2723.toInt() // EarthText
            textSize = 60f
            isFakeBoldText = true
            isAntiAlias = true
        }

        val bodyPaint = TextPaint().apply {
            color = 0xFF5D4037.toInt() // EarthDark
            textSize = 40f
            isAntiAlias = true
        }

        // 4. Drawing Content
        canvas.drawText(product.name, 70f, 680f, titlePaint)
        
        val artisanText = "Crafted by ${artisan.name} from ${artisan.village}"
        canvas.drawText(artisanText, 70f, 740f, bodyPaint)

        // 5. Drawing Story Text (Wrapping)
        val storyLayout = StaticLayout.Builder.obtain(story, 0, story.length, bodyPaint, width - 140)
            .setAlignment(Layout.Alignment.ALIGN_NORMAL)
            .build()

        canvas.save()
        canvas.translate(70f, 800f)
        storyLayout.draw(canvas)
        canvas.restore()

        // 6. Branding Footer
        val footerPaint = TextPaint().apply {
            color = 0xFF8D5524.toInt() // EarthPrimary
            textSize = 30f
            isFakeBoldText = true
        }
        canvas.drawText("KUMBARA-KALA | HERITAGE IN CLAY", 70f, height - 50f, footerPaint)

        return bitmap
    }
}
