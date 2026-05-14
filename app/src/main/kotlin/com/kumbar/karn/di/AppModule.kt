package com.kumbar.karn.di

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.kumbar.karn.data.repository.AuthRepository
import com.kumbar.karn.data.repository.FirebaseAuthRepositoryImpl
import com.kumbar.karn.data.repository.FirestoreProductRepositoryImpl
import com.kumbar.karn.data.repository.ProductRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth = FirebaseAuth.getInstance()

    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore = FirebaseFirestore.getInstance()

    @Provides
    @Singleton
    fun provideAuthRepository(impl: FirebaseAuthRepositoryImpl): AuthRepository = impl

    @Provides
    @Singleton
    fun provideProductRepository(impl: FirestoreProductRepositoryImpl): ProductRepository = impl
}
