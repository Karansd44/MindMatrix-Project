package com.kumbar.karn.ui.gallery

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.kumbar.karn.data.model.Product
import com.kumbar.karn.ui.auth.AuthViewModel
import com.kumbar.karn.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GalleryScreen(
    authViewModel: AuthViewModel,
    productViewModel: ProductViewModel = hiltViewModel(),
    onProductClick: (Product) -> Unit = {},
    onCreateStoryClick: () -> Unit = {},
    onNavigateToAI: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {},
    onNavigateToFavorites: () -> Unit = {}
) {
    val products by productViewModel.filteredProducts.collectAsState()
    val searchQuery by productViewModel.searchQuery.collectAsState()
    val selectedCategory by productViewModel.selectedCategory.collectAsState()

    val categories = listOf("cooking", "storage", "wellness", "decor")

    Scaffold(
        containerColor = Color(0xFFF5F2EC), // warm parchment
        topBar = {
            Column(
                modifier = Modifier
                    .background(Color(0xFFF5F2EC))
                    .fillMaxWidth()
                    .padding(top = 24.dp)
            ) {
                // Brand header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Kumbara-Kala",
                            style = MaterialTheme.typography.headlineMedium,
                            color = ForestGreen
                        )
                        Text(
                            text = "Handmade · Eco-friendly",
                            style = MaterialTheme.typography.bodySmall,
                            color = Terracotta
                        )
                    }
                    // Eco leaf badge
                    Surface(
                        color = ForestGreenPastel,
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text(
                            text = "🌿 Eco",
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            style = MaterialTheme.typography.labelMedium,
                            color = ForestGreen
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Warm search bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { productViewModel.setSearchQuery(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    placeholder = {
                        Text(
                            "Search handmade pieces…",
                            style = MaterialTheme.typography.bodyMedium,
                            color = InkMedium.copy(alpha = 0.6f)
                        )
                    },
                    leadingIcon = {
                        Icon(
                            Icons.Default.Search,
                            contentDescription = null,
                            tint = ForestGreen.copy(alpha = 0.6f)
                        )
                    },
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor   = ForestGreen,
                        unfocusedBorderColor = DividerColor,
                        focusedContainerColor   = PureWhite,
                        unfocusedContainerColor = PureWhite,
                        cursorColor = ForestGreen
                    ),
                    singleLine = true
                )

                // Category chips
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        EcoCategoryChip(
                            selected = selectedCategory == null,
                            label = "All",
                            onClick = { productViewModel.setCategory(null) }
                        )
                    }
                    items(categories) { category ->
                        EcoCategoryChip(
                            selected = selectedCategory == category,
                            label = category.replaceFirstChar { it.uppercase() },
                            onClick = { productViewModel.setCategory(category) }
                        )
                    }
                }
            }
        },
        bottomBar = {
            Surface(
                shadowElevation = 8.dp,
                color = PureWhite
            ) {
                NavigationBar(
                    containerColor = PureWhite,
                    tonalElevation = 0.dp
                ) {
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                        label = { Text("Home", style = MaterialTheme.typography.labelSmall) },
                        selected = true,
                        onClick = { },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor   = ForestGreen,
                            unselectedIconColor = InkLight,
                            indicatorColor      = ForestGreenPastel
                        )
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Outlined.FavoriteBorder, contentDescription = "Favourites") },
                        label = { Text("Saved", style = MaterialTheme.typography.labelSmall) },
                        selected = false,
                        onClick = onNavigateToFavorites,
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor   = ForestGreen,
                            unselectedIconColor = InkLight,
                            indicatorColor      = ForestGreenPastel
                        )
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.AutoAwesome, contentDescription = "AI Helper") },
                        label = { Text("AI", style = MaterialTheme.typography.labelSmall) },
                        selected = false,
                        onClick = onNavigateToAI,
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor   = ForestGreen,
                            unselectedIconColor = InkLight,
                            indicatorColor      = ForestGreenPastel
                        )
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                        label = { Text("Profile", style = MaterialTheme.typography.labelSmall) },
                        selected = false,
                        onClick = onNavigateToProfile,
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor   = ForestGreen,
                            unselectedIconColor = InkLight,
                            indicatorColor      = ForestGreenPastel
                        )
                    )
                }
            }
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onCreateStoryClick,
                containerColor = WhatsAppGreen,   // WhatsApp Green for share/story action
                contentColor   = PureWhite,
                shape          = RoundedCornerShape(20.dp),
                elevation      = FloatingActionButtonDefaults.elevation(defaultElevation = 8.dp)
            ) {
                Icon(Icons.Default.Share, contentDescription = "Share Story", modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Share Story", style = MaterialTheme.typography.labelLarge)
            }
        }
    ) { padding ->
        if (products.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🏺", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        "No handmade pieces found",
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkMedium,
                        textAlign = TextAlign.Center
                    )
                    Text(
                        "Try a different category",
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkLight,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(
                    start = 16.dp,
                    end   = 16.dp,
                    top   = padding.calculateTopPadding() + 8.dp,
                    bottom = padding.calculateBottomPadding() + 88.dp
                ),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement   = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(products) { product ->
                    ArtisanProductCard(
                        product = product,
                        onClick = { onProductClick(product) }
                    )
                }
            }
        }
    }
}

// ─── Eco Category Chip ────────────────────────────────────────────────────────
@Composable
fun EcoCategoryChip(
    selected: Boolean,
    label: String,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier.clickable { onClick() },
        color   = if (selected) ForestGreen else PureWhite,
        shape   = RoundedCornerShape(20.dp),
        shadowElevation = if (selected) 4.dp else 1.dp,
        border  = if (selected) null
                  else androidx.compose.foundation.BorderStroke(1.dp, DividerColor)
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            style = MaterialTheme.typography.labelMedium,
            color = if (selected) PureWhite else InkMedium
        )
    }
}

// ─── Artisan Product Card ("sitting on a table") ──────────────────────────────
@Composable
fun ArtisanProductCard(
    product: Product,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation   = 8.dp,
                shape       = RoundedCornerShape(20.dp),
                ambientColor = Color.Black.copy(alpha = 0.06f),
                spotColor   = Color.Black.copy(alpha = 0.10f)
            )
            .clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        color = PureWhite
    ) {
        Column {
            // Product image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(0.9f)
                    .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
                    .background(Color(0xFFF0EBE5))
            ) {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Eco-Score badge (Forest Green instead of gold)
                if (product.ecoScore > 0) {
                    Surface(
                        modifier = Modifier
                            .padding(8.dp)
                            .align(Alignment.TopStart),
                        color = ForestGreen,
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(
                            text = "🌿 Eco ${product.ecoScore}",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = PureWhite
                        )
                    }
                }

                // WhatsApp share quick-action
                Surface(
                    modifier = Modifier
                        .padding(8.dp)
                        .align(Alignment.TopEnd)
                        .size(32.dp),
                    color = WhatsAppGreen.copy(alpha = 0.9f),
                    shape = CircleShape
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            Icons.Default.Share,
                            contentDescription = "Share on WhatsApp",
                            tint = PureWhite,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            // Product info
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = ForestGreen
                )

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = "₹${product.price.toInt()}",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = Terracotta
                )

                Spacer(modifier = Modifier.height(6.dp))

                // Artisan tag (terracotta chip)
                Surface(
                    color = TerracottaPastel,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "Handmade",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = Terracotta
                    )
                }
            }
        }
    }
}
