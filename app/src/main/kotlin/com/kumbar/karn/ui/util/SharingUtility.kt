package com.kumbar.karn.ui.util

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import androidx.core.content.FileProvider
import com.kumbar.karn.data.model.Product
import java.io.File
import java.io.FileOutputStream

/**
 * SharingUtility: Production-ready sharing logic for Android 13+ (Scoped Storage).
 * Handles direct WhatsApp integration with generated Benefit Cards.
 */
object SharingUtility {

    private const val AUTHORITY = "com.kumbar.karn.fileprovider"

    fun shareBenefitCard(context: Context, bitmap: Bitmap, product: Product) {
        try {
            // 1. Save bitmap to cache directory (internal storage, no permission needed)
            val cachePath = File(context.cacheDir, "benefit_cards")
            cachePath.mkdirs()
            val fileName = "benefit_${product.id}_${System.currentTimeMillis()}.png"
            val file = File(cachePath, fileName)
            
            val stream = FileOutputStream(file)
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
            stream.close()

            // 2. Get URI via FileProvider
            val contentUri: Uri = FileProvider.getUriForFile(context, AUTHORITY, file)

            // 3. Create Intent for sharing
            val shareIntent = Intent().apply {
                action = Intent.ACTION_SEND
                type = "image/png"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                
                // Pre-filled caption with health benefit context
                val caption = "Check out this ${product.name} from Kumbara-Kala! " +
                        "It's not just a craft; it's health science. #Handmade #ArtisanalWellness"
                putExtra(Intent.EXTRA_TEXT, caption)
                
                // Specifically targeting WhatsApp if available, or using chooser
                `package` = "com.whatsapp"
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            try {
                context.startActivity(shareIntent)
            } catch (e: Exception) {
                // Fallback to general chooser if WhatsApp is not installed
                val chooser = Intent.createChooser(shareIntent.apply { `package` = null }, "Share via")
                context.startActivity(chooser)
            }

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
