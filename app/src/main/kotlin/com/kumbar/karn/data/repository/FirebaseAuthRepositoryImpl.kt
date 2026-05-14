package com.kumbar.karn.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.kumbar.karn.data.model.User
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import javax.inject.Inject
import kotlin.coroutines.resume

class FirebaseAuthRepositoryImpl @Inject constructor(
    private val auth: FirebaseAuth,
    private val database: FirebaseDatabase
) : AuthRepository {

    private val usersRef get() = database.getReference("users")

    override val currentUser: Flow<User?> = callbackFlow {
        val authListener = FirebaseAuth.AuthStateListener { firebaseAuth ->
            val firebaseUser = firebaseAuth.currentUser
            if (firebaseUser == null) {
                trySend(null)
            } else {
                usersRef.child(firebaseUser.uid).get()
                    .addOnSuccessListener { snapshot ->
                        val user = snapshot.getValue(User::class.java)
                        trySend(user)
                    }
                    .addOnFailureListener {
                        trySend(null)
                    }
            }
        }
        auth.addAuthStateListener(authListener)
        awaitClose { auth.removeAuthStateListener(authListener) }
    }

    override suspend fun login(email: String, pass: String): Result<User> {
        return suspendCancellableCoroutine { cont ->
            auth.signInWithEmailAndPassword(email, pass)
                .addOnSuccessListener { result ->
                    val uid = result.user?.uid ?: run {
                        cont.resume(Result.failure(Exception("Login failed")))
                        return@addOnSuccessListener
                    }
                    usersRef.child(uid).get()
                        .addOnSuccessListener { snapshot ->
                            val user = snapshot.getValue(User::class.java)
                            if (user != null) {
                                cont.resume(Result.success(user))
                            } else {
                                cont.resume(Result.failure(Exception("User data not found")))
                            }
                        }
                        .addOnFailureListener { cont.resume(Result.failure(it)) }
                }
                .addOnFailureListener { cont.resume(Result.failure(it)) }
        }
    }

    override suspend fun register(user: User, pass: String): Result<User> {
        return suspendCancellableCoroutine { cont ->
            auth.createUserWithEmailAndPassword(user.email, pass)
                .addOnSuccessListener { result ->
                    val uid = result.user?.uid ?: run {
                        cont.resume(Result.failure(Exception("Registration failed")))
                        return@addOnSuccessListener
                    }
                    val finalUser = user.copy(userId = uid)
                    usersRef.child(uid).setValue(finalUser)
                        .addOnSuccessListener { cont.resume(Result.success(finalUser)) }
                        .addOnFailureListener { cont.resume(Result.failure(it)) }
                }
                .addOnFailureListener { cont.resume(Result.failure(it)) }
        }
    }

    override suspend fun googleLogin(idToken: String): Result<User> {
        return suspendCancellableCoroutine { cont ->
            val credential = com.google.firebase.auth.GoogleAuthProvider.getCredential(idToken, null)
            auth.signInWithCredential(credential)
                .addOnSuccessListener { result ->
                    val uid = result.user?.uid ?: run {
                        cont.resume(Result.failure(Exception("Google Login failed")))
                        return@addOnSuccessListener
                    }
                    usersRef.child(uid).get()
                        .addOnSuccessListener { snapshot ->
                            if (snapshot.exists()) {
                                val user = snapshot.getValue(User::class.java)
                                if (user != null) {
                                    cont.resume(Result.success(user))
                                } else {
                                    cont.resume(Result.failure(Exception("User data error")))
                                }
                            } else {
                                // First-time Google Sign-in — create a customer profile
                                val newUser = User(
                                    userId = uid,
                                    name = result.user?.displayName ?: "Google User",
                                    email = result.user?.email ?: "",
                                    role = "customer"
                                )
                                usersRef.child(uid).setValue(newUser)
                                    .addOnSuccessListener { cont.resume(Result.success(newUser)) }
                                    .addOnFailureListener { cont.resume(Result.failure(it)) }
                            }
                        }
                        .addOnFailureListener { cont.resume(Result.failure(it)) }
                }
                .addOnFailureListener { cont.resume(Result.failure(it)) }
        }
    }

    override suspend fun logout() {
        auth.signOut()
    }
}
