package com.kumbar.karn.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.kumbar.karn.data.model.Product
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

class FirestoreProductRepositoryImpl @Inject constructor(
    private val firestore: FirebaseFirestore
) : ProductRepository {

    override fun getProducts(): Flow<List<Product>> = callbackFlow {
        val subscription = firestore.collection("products")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val products = snapshot?.toObjects(Product::class.java) ?: emptyList()
                trySend(products)
            }
        awaitClose { subscription.remove() }
    }

    override suspend fun getProductById(id: String): Product? {
        return try {
            val doc = firestore.collection("products").document(id).get().await()
            doc.toObject(Product::class.java)
        } catch (e: Exception) {
            null
        }
    }

    override suspend fun addProduct(product: Product): Result<Unit> {
        return try {
            val docRef = if (product.id.isEmpty()) {
                firestore.collection("products").document()
            } else {
                firestore.collection("products").document(product.id)
            }
            val finalProduct = product.copy(id = docRef.id)
            docRef.set(finalProduct).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateProduct(product: Product): Result<Unit> {
        return try {
            firestore.collection("products").document(product.id).set(product).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun deleteProduct(id: String): Result<Unit> {
        return try {
            firestore.collection("products").document(id).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
