package com.kumbar.karn.data.repository

import com.kumbar.karn.data.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    val currentUser: Flow<User?>
    suspend fun login(email: String, pass: String): Result<User>
    suspend fun register(user: User, pass: String): Result<User>
    suspend fun logout()
}
