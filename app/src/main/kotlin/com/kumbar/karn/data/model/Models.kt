package com.kumbar.karn.data.model

import com.google.firebase.Timestamp

data class User(
    val userId: String = "",
    val name: String = "",
    val email: String = "",
    val phone: String? = null,
    val role: String = "artisan", // artisan, customer, admin
    val village: String? = null,
    val profileImage: String? = null,
    val languagePreference: String? = "en",
    val artisanType: String? = null,
    val experience: Int? = null,
    val heritageStory: String? = null,
    val favorites: List<String>? = emptyList()
)

data class Product(
    val id: String = "",
    val artisanId: String = "",
    val name: String = "",
    val benefit: String = "",
    val description: String = "",
    val story: String = "",
    val category: String = "cooking", // cooking, storage, wellness
    val price: Double = 0.0,
    val imageUrl: String = "",
    val images: List<String> = emptyList(),
    val availability: String = "in-stock",
    val ecoScore: Int = 0,
    val plasticReduced: String? = null,
    val usageInstructions: String? = null,
    val createdAt: Timestamp? = null,
    val updatedAt: Timestamp? = null
)

data class Artisan(
    val name: String = "",
    val phone: String = "",
    val location: String = "",
    val village: String = "",
    val experience: Int = 0,
    val heritageStory: String = "",
    val profileImage: String? = null
)

data class Order(
    val id: String = "",
    val artisanId: String = "",
    val customerId: String = "",
    val customerName: String = "",
    val customerPhone: String = "",
    val productId: String = "",
    val productName: String = "",
    val productImage: String = "",
    val quantity: Int = 1,
    val totalPrice: Double = 0.0,
    val status: String = "pending",
    val createdAt: Timestamp? = null,
    val updatedAt: Timestamp? = null
)

data class CustomRequest(
    val id: String = "",
    val artisanId: String = "",
    val customerId: String = "",
    val customerName: String = "",
    val description: String = "",
    val status: String = "pending",
    val createdAt: Timestamp? = null
)
