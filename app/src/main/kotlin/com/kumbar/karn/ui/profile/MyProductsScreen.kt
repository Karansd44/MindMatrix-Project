package com.kumbar.karn.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.kumbar.karn.ui.auth.AuthViewModel
import com.kumbar.karn.ui.gallery.HeritageProductCard
import com.kumbar.karn.ui.gallery.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyProductsScreen(
    authViewModel: AuthViewModel,
    productViewModel: ProductViewModel = hiltViewModel(),
    onBack: () -> Unit
) {
    val currentUser by authViewModel.currentUser.collectAsState()
    val allProducts by productViewModel.filteredProducts.collectAsState()
    
    // Filter to only show products uploaded by the current artisan
    val myProducts = allProducts.filter { it.artisanId == currentUser?.userId }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = if (currentUser?.role == "artisan") "MY ARCHIVES" else "MY ORDERS",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary,
                        letterSpacing = 2.sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = MaterialTheme.colorScheme.primary)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { padding ->
        if (myProducts.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "NO ITEMS YET",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                    letterSpacing = 2.sp
                )
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(
                    start = 24.dp,
                    end = 24.dp,
                    top = padding.calculateTopPadding(),
                    bottom = padding.calculateBottomPadding() + 24.dp
                ),
                horizontalArrangement = Arrangement.spacedBy(20.dp),
                verticalArrangement = Arrangement.spacedBy(32.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(myProducts) { product ->
                    HeritageProductCard(
                        product = product,
                        onClick = { /* View details */ },
                        onShareClick = { /* Share product */ }
                    )
                }
            }
        }
    }
}
