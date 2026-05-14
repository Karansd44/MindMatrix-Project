package com.kumbar.karn.data.repository

import android.net.Uri
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.util.UUID
import javax.inject.Inject

class FirebaseStorageRepositoryImpl @Inject constructor(
    private val storage: FirebaseStorage
) : StorageRepository {

    override suspend fun uploadProductImage(imageUri: Uri, fileName: String): Result<String> {
        return try {
            val uniqueFileName = "${UUID.randomUUID()}_$fileName"
            val storageRef = storage.reference.child("product_images/$uniqueFileName")
            
            // Upload the file
            storageRef.putFile(imageUri).await()
            
            // Get the download URL
            val downloadUrl = storageRef.downloadUrl.await().toString()
            Result.success(downloadUrl)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
