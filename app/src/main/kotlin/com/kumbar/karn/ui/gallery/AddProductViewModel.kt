package com.kumbar.karn.ui.gallery

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kumbar.karn.data.model.Product
import com.kumbar.karn.data.repository.ProductRepository
import com.kumbar.karn.data.repository.StorageRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AddProductViewModel @Inject constructor(
    private val productRepository: ProductRepository,
    private val storageRepository: StorageRepository
) : ViewModel() {

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _uploadSuccess = MutableStateFlow(false)
    val uploadSuccess: StateFlow<Boolean> = _uploadSuccess.asStateFlow()

    fun addProduct(
        artisanId: String,
        name: String,
        description: String,
        price: Double,
        category: String,
        imageUri: Uri?
    ) {
        if (name.isBlank() || description.isBlank() || price <= 0 || imageUri == null) {
            _error.value = "Please fill all fields and select an image."
            return
        }

        _loading.value = true
        _error.value = null

        viewModelScope.launch {
            // 1. Upload image to Storage
            val fileName = "product_${System.currentTimeMillis()}.jpg"
            val storageResult = storageRepository.uploadProductImage(imageUri, fileName)

            if (storageResult.isSuccess) {
                val imageUrl = storageResult.getOrNull() ?: ""
                
                // 2. Save product to Firestore
                val product = Product(
                    artisanId = artisanId,
                    name = name,
                    description = description,
                    price = price,
                    category = category.lowercase(),
                    imageUrl = imageUrl
                )
                
                val dbResult = productRepository.addProduct(product)
                
                if (dbResult.isSuccess) {
                    _uploadSuccess.value = true
                } else {
                    _error.value = dbResult.exceptionOrNull()?.message ?: "Failed to save product details."
                }
            } else {
                _error.value = storageResult.exceptionOrNull()?.message ?: "Failed to upload image."
            }
            
            _loading.value = false
        }
    }
}
