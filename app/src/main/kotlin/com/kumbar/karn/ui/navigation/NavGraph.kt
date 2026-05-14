package com.kumbar.karn.ui.navigation

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.kumbar.karn.ui.auth.AuthViewModel
import com.kumbar.karn.ui.auth.LoginScreen
import com.kumbar.karn.ui.auth.RegisterScreen
import com.kumbar.karn.ui.gallery.ChatScreen
import com.kumbar.karn.ui.gallery.GalleryScreen
import com.kumbar.karn.ui.gallery.StoryGeneratorScreen
import com.kumbar.karn.ui.profile.ProfileScreen

@Composable
fun NavGraph(
    navController: NavHostController = rememberNavController(),
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val currentUser by authViewModel.currentUser.collectAsState()

    val startDestination = if (currentUser == null) "login" else "gallery"

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable("login") {
            com.kumbar.karn.ui.auth.LoginScreen(
                viewModel = authViewModel,
                onRegisterClick = { navController.navigate("register") },
                onLoginSuccess = {
                    navController.navigate("gallery") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        composable("register") {
            com.kumbar.karn.ui.auth.RegisterScreen(
                viewModel = authViewModel,
                onLoginClick = { navController.navigate("login") },
                onLoginSuccess = {
                    navController.navigate("gallery") {
                        popUpTo("register") { inclusive = true }
                    }
                }
            )
        }
        composable("gallery") {
            GalleryScreen(
                authViewModel = authViewModel,
                onProductClick = { product ->
                    navController.navigate("productDetail/${product.id}")
                },
                onCreateStoryClick = {
                    navController.navigate("storyGenerator")
                },
                onNavigateToAI = {
                    navController.navigate("aiHelper")
                },
                onNavigateToProfile = {
                    navController.navigate("profile")
                },
                onNavigateToFavorites = {
                    // navController.navigate("favorites")
                },
                onNavigateToAddProduct = {
                    navController.navigate("addProduct")
                }
            )
        }
        composable("addProduct") {
            com.kumbar.karn.ui.gallery.AddProductScreen(
                authViewModel = authViewModel,
                onBack = { navController.popBackStack() },
                onSuccess = { navController.popBackStack() }
            )
        }
        composable("productDetail/{productId}") { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            // TODO: Create ProductDetailScreen
            Text("Product Detail for $productId")
        }
        composable("storyGenerator") {
            StoryGeneratorScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable("aiHelper") {
            ChatScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable("profile") {
            com.kumbar.karn.ui.profile.ProfileScreen(
                authViewModel = authViewModel,
                onBack = { navController.popBackStack() },
                onLogoutSuccess = {
                    navController.navigate("login") {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onNavigateToMyProducts = {
                    navController.navigate("myProducts")
                },
                onNavigateToSettings = {
                    navController.navigate("accountSettings")
                }
            )
        }
        composable("myProducts") {
            com.kumbar.karn.ui.profile.MyProductsScreen(
                authViewModel = authViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable("accountSettings") {
            com.kumbar.karn.ui.profile.AccountSettingsScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
