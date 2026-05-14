package com.kumbar.karn.ui.gallery

import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.ImageLoader
import coil.compose.AsyncImage
import coil.request.ImageRequest
import coil.request.SuccessResult
import com.kumbar.karn.data.model.Product
import com.kumbar.karn.data.model.User
import com.kumbar.karn.ui.auth.AuthViewModel
import com.kumbar.karn.ui.util.BenefitCardEngine
import com.kumbar.karn.ui.util.SharingUtility
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GalleryScreen(
    authViewModel: AuthViewModel,
    productViewModel: ProductViewModel = hiltViewModel(),
    onProductClick: (Product) -> Unit = {},
    onCreateStoryClick: () -> Unit = {},
    onNavigateToAI: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {},
    onNavigateToFavorites: () -> Unit = {},
    onNavigateToAddProduct: () -> Unit = {}
) {
    val products by productViewModel.filteredProducts.collectAsState()
    val searchQuery by productViewModel.searchQuery.collectAsState()
    val selectedCategory by productViewModel.selectedCategory.collectAsState()
    val currentUser by authViewModel.currentUser.collectAsState()
    
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val categories = listOf("cooking", "storage", "wellness", "decor")

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Column(
                modifier = Modifier
                    .background(MaterialTheme.colorScheme.background)
                    .fillMaxWidth()
                    .padding(top = 24.dp)
            ) {
                Text(
                    text = "KUMBARA-KALA",
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    letterSpacing = 4.sp,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(24.dp))

                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { productViewModel.setSearchQuery(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp),
                    placeholder = { 
                        Text("Search legacy crafts...", style = MaterialTheme.typography.bodyMedium) 
                    },
                    shape = MaterialTheme.shapes.small,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                    ),
                    singleLine = true
                )

                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(horizontal = 24.dp, vertical = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        HeritageCategoryChip(
                            selected = selectedCategory == null,
                            label = "All Works",
                            onClick = { productViewModel.setCategory(null) }
                        )
                    }
                    items(categories) { category ->
                        HeritageCategoryChip(
                            selected = selectedCategory == category,
                            label = category.replaceFirstChar { it.uppercase() },
                            onClick = { productViewModel.setCategory(category) }
                        )
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.background,
                tonalElevation = 0.dp,
                modifier = Modifier.border(0.5.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
            ) {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    selected = true,
                    onClick = { /* Already here */ }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.AutoAwesome, contentDescription = "AI") },
                    selected = false,
                    onClick = onNavigateToAI
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                    selected = false,
                    onClick = onNavigateToProfile
                )
            }
        },
        floatingActionButton = {
            if (currentUser?.role == "artisan") {
                FloatingActionButton(
                    onClick = onNavigateToAddProduct,
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                ) {
                    Icon(androidx.compose.material.icons.Icons.Default.Add, contentDescription = "Add Product")
                }
            }
        }
    ) { padding ->
        if (products.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("THE ARCHIVES ARE EMPTY", style = MaterialTheme.typography.labelMedium)
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(
                    start = 24.dp,
                    end = 24.dp,
                    top = padding.calculateTopPadding(),
                    bottom = padding.calculateBottomPadding() + 80.dp
                ),
                horizontalArrangement = Arrangement.spacedBy(20.dp),
                verticalArrangement = Arrangement.spacedBy(32.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(products) { product ->
                    HeritageProductCard(
                        product = product,
                        onClick = { onProductClick(product) },
                        onShareClick = {
                            scope.launch {
                                // 1. Download image bitmap
                                val loader = ImageLoader(context)
                                val request = ImageRequest.Builder(context)
                                    .data(product.imageUrl)
                                    .allowHardware(false) // Required for Canvas processing
                                    .build()
                                
                                val result = (loader.execute(request) as? SuccessResult)?.drawable
                                val bitmap = (result as? BitmapDrawable)?.bitmap
                                
                                if (bitmap != null) {
                                    // 2. Generate Benefit Card
                                    val benefitCard = BenefitCardEngine.generateBenefitCard(
                                        context = context,
                                        product = product,
                                        artisan = currentUser ?: User(name = "Master Artisan"),
                                        productBitmap = bitmap
                                    )
                                    
                                    // 3. Share to WhatsApp
                                    SharingUtility.shareBenefitCard(context, benefitCard, product)
                                }
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun HeritageCategoryChip(
    selected: Boolean,
    label: String,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier.clickable { onClick() },
        color = if (selected) MaterialTheme.colorScheme.primary else Color.Transparent,
        shape = MaterialTheme.shapes.small,
        border = if (selected) null else androidx.compose.foundation.BorderStroke(0.5.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
    ) {
        Text(
            text = label.uppercase(),
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            style = MaterialTheme.typography.labelMedium,
            color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.primary,
            letterSpacing = 1.sp
        )
    }
}

@Composable
fun HeritageProductCard(
    product: Product,
    onClick: () -> Unit,
    onShareClick: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth().clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(0.85f)
                .background(MaterialTheme.colorScheme.surface)
                .border(0.5.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
        ) {
            AsyncImage(
                model = product.imageUrl,
                contentDescription = product.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            
            // Premium Badge
            if (product.ecoScore > 0) {
                Surface(
                    modifier = Modifier.padding(8.dp).align(Alignment.TopEnd),
                    color = MaterialTheme.colorScheme.tertiary,
                    shape = RoundedCornerShape(2.dp)
                ) {
                    Text(
                        text = "HEALTH ${product.ecoScore}",
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelMedium.copy(fontSize = 8.sp, fontWeight = FontWeight.Bold),
                        color = Color.White
                    )
                }
            }

            // Share Button
            IconButton(
                onClick = onShareClick,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(8.dp)
                    .background(Color.Black.copy(alpha = 0.4f), CircleShape)
                    .size(32.dp)
            ) {
                Icon(Icons.Default.Share, contentDescription = "Share", tint = Color.White, modifier = Modifier.size(16.dp))
            }
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Text(
            text = product.name,
            style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
        
        Text(
            text = "₹${product.price.toInt()}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.secondary
        )
    }
}
