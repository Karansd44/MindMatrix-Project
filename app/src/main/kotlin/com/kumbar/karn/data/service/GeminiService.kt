package com.kumbar.karn.data.service

import com.kumbar.karn.BuildConfig
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.kumbar.karn.data.model.Product
import com.kumbar.karn.data.model.User
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GeminiService @Inject constructor() {

    private val generativeModel = GenerativeModel(
        modelName = "gemini-1.5-flash",
        apiKey = BuildConfig.GEMINI_API_KEY
    )

    suspend fun generateStory(product: Product, artisan: User): String? {
        val prompt = """
            You are a master storyteller for Kumbara-Kala, a platform that empowers rural pottery artisans.
            Generate a compelling "Digital Story Card" narrative for the following product:
            Product Name: ${product.name}
            Category: ${product.category}
            Artisan Name: ${artisan.name}
            Village: ${artisan.village}
            Experience: ${artisan.experience} years
            Heritage Story: ${artisan.heritageStory}
            
            The story should:
            1. Highlight the scientific/health benefits of clay pottery (e.g., alkalinity, mineral retention).
            2. Connect the product to the artisan's personal heritage and skill.
            3. Be concise (approx 100 words) and suitable for a social media card.
            4. Tone: Friendly Educator.
            
            Product Health Facts: ${product.benefit}
        """.trimIndent()

        return try {
            val response = generativeModel.generateContent(prompt)
            response.text
        } catch (e: Exception) {
            null
        }
    }
}
