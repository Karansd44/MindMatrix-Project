package com.kumbar.karn.data.repository

import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.kumbar.karn.data.model.Product
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import javax.inject.Inject
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class RealtimeProductRepositoryImpl @Inject constructor(
    private val database: FirebaseDatabase
) : ProductRepository {

    private val productsRef get() = database.getReference("products")

    override fun getProducts(): Flow<List<Product>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val products = snapshot.children.mapNotNull { child ->
                    child.getValue(Product::class.java)?.copy(id = child.key ?: "")
                }
                trySend(products)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        productsRef.addValueEventListener(listener)
        awaitClose { productsRef.removeEventListener(listener) }
    }

    override suspend fun getProductById(id: String): Product? {
        return suspendCancellableCoroutine { cont ->
            productsRef.child(id).get()
                .addOnSuccessListener { snapshot ->
                    val product = snapshot.getValue(Product::class.java)?.copy(id = snapshot.key ?: "")
                    cont.resume(product)
                }
                .addOnFailureListener { cont.resume(null) }
        }
    }

    override suspend fun addProduct(product: Product): Result<Unit> {
        return suspendCancellableCoroutine { cont ->
            // Generate a new key if no ID, else use existing
            val ref = if (product.id.isEmpty()) productsRef.push() else productsRef.child(product.id)
            val finalProduct = product.copy(id = ref.key ?: "")
            ref.setValue(finalProduct)
                .addOnSuccessListener { cont.resume(Result.success(Unit)) }
                .addOnFailureListener { cont.resume(Result.failure(it)) }
        }
    }

    override suspend fun updateProduct(product: Product): Result<Unit> {
        return suspendCancellableCoroutine { cont ->
            productsRef.child(product.id).setValue(product)
                .addOnSuccessListener { cont.resume(Result.success(Unit)) }
                .addOnFailureListener { cont.resume(Result.failure(it)) }
        }
    }

    override suspend fun deleteProduct(id: String): Result<Unit> {
        return suspendCancellableCoroutine { cont ->
            productsRef.child(id).removeValue()
                .addOnSuccessListener { cont.resume(Result.success(Unit)) }
                .addOnFailureListener { cont.resume(Result.failure(it)) }
        }
    }
}
