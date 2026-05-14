package com.kumbar.karn.ui.gallery

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kumbar.karn.data.model.Product
import com.kumbar.karn.data.model.User
import com.kumbar.karn.data.repository.AuthRepository
import com.kumbar.karn.data.service.GeminiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class StoryViewModel @Inject constructor(
    private val geminiService: GeminiService,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _generatedStory = MutableStateFlow<String?>(null)
    val generatedStory = _generatedStory.asStateFlow()

    private val _isGenerating = MutableStateFlow(false)
    val isGenerating = _isGenerating.asStateFlow()

    fun generateStory(product: Product) {
        viewModelScope.launch {
            _isGenerating.value = true
            val user = authRepository.currentUser.first()
            if (user != null) {
                val story = geminiService.generateStory(product, user)
                _generatedStory.value = story
            }
            _isGenerating.value = false
        }
    }
    
    fun resetStory() {
        _generatedStory.value = null
    }
}
