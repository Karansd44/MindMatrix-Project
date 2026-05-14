package com.kumbar.karn.di

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.storage.FirebaseStorage
import com.kumbar.karn.data.repository.AuthRepository
import com.kumbar.karn.data.repository.FirebaseAuthRepositoryImpl
import com.kumbar.karn.data.repository.FirebaseStorageRepositoryImpl
import com.kumbar.karn.data.repository.ProductRepository
import com.kumbar.karn.data.repository.RealtimeProductRepositoryImpl
import com.kumbar.karn.data.repository.StorageRepository
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
    fun provideFirebaseDatabase(): FirebaseDatabase {
        val db = FirebaseDatabase.getInstance()
        db.setPersistenceEnabled(true) // Enable offline caching
        return db
    }

    @Provides
    @Singleton
    fun provideFirebaseStorage(): FirebaseStorage = FirebaseStorage.getInstance()

    @Provides
    @Singleton
    fun provideAuthRepository(impl: FirebaseAuthRepositoryImpl): AuthRepository = impl

    @Provides
    @Singleton
    fun provideProductRepository(impl: RealtimeProductRepositoryImpl): ProductRepository = impl

    @Provides
    @Singleton
    fun provideStorageRepository(impl: FirebaseStorageRepositoryImpl): StorageRepository = impl
}
