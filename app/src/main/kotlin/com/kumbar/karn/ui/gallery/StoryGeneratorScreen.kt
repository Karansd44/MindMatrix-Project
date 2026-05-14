package com.kumbar.karn.ui.gallery

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.kumbar.karn.data.model.Product

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StoryGeneratorScreen(
    onBack: () -> Unit,
    productViewModel: ProductViewModel = hiltViewModel(),
    storyViewModel: StoryViewModel = hiltViewModel()
) {
    val products by productViewModel.filteredProducts.collectAsState()
    var selectedProduct by remember { mutableStateOf<Product?>(null) }
    val generatedStory by storyViewModel.generatedStory.collectAsState()
    val isGenerating by storyViewModel.isGenerating.collectAsState()

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            CenterAlignedTopAppBar(
                title = { 
                    Text(
                        "HERITAGE NARRATIVE",
                        style = MaterialTheme.typography.labelMedium,
                        letterSpacing = 2.sp,
                        color = MaterialTheme.colorScheme.primary
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.primary)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            Text(
                text = "I. SELECT AN ARTISAN MASTERPIECE",
                style = MaterialTheme.typography.labelMedium,
                letterSpacing = 1.sp,
                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f)
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(products) { product ->
                    HeritageProductSelectorCard(
                        product = product,
                        selected = selectedProduct?.id == product.id,
                        onClick = { selectedProduct = product }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(48.dp))
            
            Button(
                onClick = { selectedProduct?.let { storyViewModel.generateStory(it) } },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = selectedProduct != null && !isGenerating,
                shape = MaterialTheme.shapes.small,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
            ) {
                if (isGenerating) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                } else {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        "CRAFT NARRATIVE",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                    )
                }
            }
            
            if (generatedStory != null) {
                Spacer(modifier = Modifier.height(56.dp))
                
                Text(
                    text = "THE ARTISAN'S TALE",
                    style = MaterialTheme.typography.labelMedium,
                    letterSpacing = 1.sp,
                    color = MaterialTheme.colorScheme.secondary
                )
                
                Spacer(modifier = Modifier.height(20.dp))
                
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.small,
                    color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.tertiary.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(28.dp)) {
                        Box(modifier = Modifier.width(40.dp).height(2.dp).background(MaterialTheme.colorScheme.tertiary))
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Text(
                            text = generatedStory!!,
                            style = MaterialTheme.typography.bodyLarge.copy(
                                lineHeight = 30.sp,
                                fontFamily = androidx.compose.ui.text.font.FontFamily.Serif,
                                fontWeight = FontWeight.Light
                            ),
                            textAlign = TextAlign.Justify,
                            color = MaterialTheme.colorScheme.primary
                        )
                        
                        Spacer(modifier = Modifier.height(40.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Button(
                                onClick = { /* TODO: Share */ },
                                modifier = Modifier.weight(1f),
                                shape = MaterialTheme.shapes.small,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.secondary
                                )
                            ) {
                                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("SHARE", style = MaterialTheme.typography.labelMedium)
                            }
                            
                            OutlinedButton(
                                onClick = { storyViewModel.resetStory() },
                                modifier = Modifier.weight(1f),
                                shape = MaterialTheme.shapes.small,
                                border = BorderStroke(0.5.dp, MaterialTheme.colorScheme.primary)
                            ) {
                                Text("REGENERATE", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(32.dp))
                
                Text(
                    text = "Artisanal Narratives: Bridging Generations through Storytelling.",
                    style = MaterialTheme.typography.bodySmall.copy(fontFamily = androidx.compose.ui.text.font.FontFamily.Serif),
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}

@Composable
fun HeritageProductSelectorCard(
    product: Product,
    selected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .width(110.dp)
            .clickable { onClick() },
        shape = MaterialTheme.shapes.small,
        border = BorderStroke(
            width = if (selected) 2.dp else 0.5.dp,
            color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
        ),
        color = if (selected) MaterialTheme.colorScheme.surface else Color.Transparent
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            AsyncImage(
                model = product.imageUrl,
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp),
                contentScale = ContentScale.Crop
            )
            Text(
                text = product.name.uppercase(),
                modifier = Modifier.padding(10.dp),
                style = MaterialTheme.typography.labelMedium,
                maxLines = 1,
                fontSize = 9.sp,
                letterSpacing = 1.sp,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}
