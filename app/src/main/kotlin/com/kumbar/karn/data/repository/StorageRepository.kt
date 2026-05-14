package com.kumbar.karn.data.repository

import android.net.Uri

interface StorageRepository {
    suspend fun uploadProductImage(imageUri: Uri, fileName: String): Result<String>
}
