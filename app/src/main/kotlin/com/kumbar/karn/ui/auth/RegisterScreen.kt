package com.kumbar.karn.ui.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.kumbar.karn.data.model.User
import com.kumbar.karn.ui.theme.*

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onLoginClick: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("artisan") }
    var village by remember { mutableStateOf("") }
    var artisanType by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var language by remember { mutableStateOf("en") }

    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Join Kumbara-Kala",
            style = MaterialTheme.typography.headlineMedium,
            color = ForestGreen,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Handmade · Eco-friendly community",
            style = MaterialTheme.typography.bodyMedium,
            color = Terracotta
        )
        
        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = "Choose your role",
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.align(Alignment.Start)
        )
        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            RoleCard(
                title = "Artisan",
                icon = Icons.Default.Store,
                selected = role == "artisan",
                onClick = { role = "artisan" },
                modifier = Modifier.weight(1f)
            )
            RoleCard(
                title = "Customer",
                icon = Icons.Default.Person,
                selected = role == "customer",
                onClick = { role = "customer" },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
        HorizontalDivider(thickness = 1.dp, color = MaterialTheme.colorScheme.outlineVariant)
        Spacer(modifier = Modifier.height(24.dp))

        val fieldColors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor   = ForestGreen,
            unfocusedBorderColor = DividerColor,
            focusedLabelColor    = ForestGreen,
            cursorColor          = ForestGreen
        )
        val fieldShape = RoundedCornerShape(16.dp)

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Full Name") },
            modifier = Modifier.fillMaxWidth(),
            shape = fieldShape,
            colors = fieldColors
        )
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            shape = fieldShape,
            colors = fieldColors
        )
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Phone Number") },
            modifier = Modifier.fillMaxWidth(),
            shape = fieldShape,
            colors = fieldColors
        )
        Spacer(modifier = Modifier.height(16.dp))

        if (role == "artisan") {
            OutlinedTextField(
                value = village,
                onValueChange = { village = it },
                label = { Text("Village") },
                modifier = Modifier.fillMaxWidth(),
                shape = fieldShape,
                colors = fieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = artisanType,
                onValueChange = { artisanType = it },
                label = { Text("Artisan Type (e.g. Potter, Weaver)") },
                modifier = Modifier.fillMaxWidth(),
                shape = fieldShape,
                colors = fieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            shape = fieldShape,
            colors = fieldColors
        )
        
        if (error != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = error!!, color = MaterialTheme.colorScheme.error)
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = {
                viewModel.register(
                    User(
                        name = name,
                        email = email,
                        phone = phone,
                        village = village,
                        role = role,
                        artisanType = artisanType,
                        languagePreference = language
                    ),
                    password
                )
            },
            modifier = Modifier.fillMaxWidth().height(54.dp),
            enabled = !loading,
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = ForestGreen,
                contentColor   = PureWhite
            )
        ) {
            if (loading) {
                CircularProgressIndicator(
                    color = PureWhite,
                    modifier = Modifier.size(24.dp),
                    strokeWidth = 2.dp
                )
            } else {
                Text("Create Account", style = MaterialTheme.typography.labelLarge)
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text("Already a member? ", style = MaterialTheme.typography.bodyMedium, color = InkMedium)
            TextButton(onClick = onLoginClick, contentPadding = PaddingValues(0.dp)) {
                Text(
                    "Sign in",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = ForestGreen
                )
            }
        }
    }
}

@Composable
fun RoleCard(
    title: String,
    icon: ImageVector,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = if (selected) ForestGreenPastel else PureWhite
        ),
        border = if (selected) BorderStroke(2.dp, ForestGreen) else BorderStroke(1.dp, DividerColor),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = if (selected) 4.dp else 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(32.dp),
                tint = if (selected) ForestGreen else InkMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                color = if (selected) ForestGreen else InkMedium
            )
        }
    }
}
