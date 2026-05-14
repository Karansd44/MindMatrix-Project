package com.kumbar.karn.ui.gallery

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.kumbar.karn.BuildConfig
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class Message(val text: String, val isUser: Boolean)

@HiltViewModel
class ChatViewModel @Inject constructor() : ViewModel() {

    private val generativeModel = GenerativeModel(
        modelName = "gemini-1.5-flash",
        apiKey = BuildConfig.GEMINI_API_KEY
    )

    private val _messages = MutableStateFlow<List<Message>>(listOf(
        Message("Namaste! I am your Kumbara-Kala assistant. How can I help you today?", false)
    ))
    val messages = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    fun sendMessage(text: String) {
        if (text.isBlank()) return
        
        val userMessage = Message(text, true)
        _messages.value = _messages.value + userMessage
        
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = generativeModel.generateContent(text)
                val aiMessage = Message(response.text ?: "I'm sorry, I couldn't understand that.", false)
                _messages.value = _messages.value + aiMessage
            } catch (e: Exception) {
                _messages.value = _messages.value + Message("Error: ${e.message}", false)
            }
            _isLoading.value = false
        }
    }
}
