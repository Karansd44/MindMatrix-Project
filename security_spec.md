# Security Specification for Kumbara-Kala

## 1. Data Invariants
- A **User** document must have a `userId` matching the authenticated user's `uid`.
- Users cannot change their own `role` or `userId` once set.
- **Products** can only be created, updated, or deleted by users with the `artisan` role.
- Customers can only read and favorite products.
- Admins have full access to manage metadata (fake products, user bans).

## 2. Dirty Dozen Payloads (Identity, Integrity, State)
1. **Identity Spoofing**: Attempt to create a user profile with a different `uid` than the authenticated one.
2. **Privilege Escalation**: User tries to update their role from `customer` to `admin`.
3. **Ghost Field**: Attempt to add a `verified: true` field to a product during creation.
4. **Invalid Type**: Set `price` as a string instead of a number.
5. **ID Poisoning**: Use a 2KB string as a `productId`.
6. **Orphaned Write**: Create a product with an `artisanId` that doesn't exist in `/users/`.
7. **Cross-User Leak**: Customer attempts to delete a product owned by another artisan.
8. **Resource Exhaustion**: Send a 1MB string in `heritageStory`.
9. **State Shortcut**: Update product `availability` to `in-stock` without being the owner.
10. **Shadow Update**: Add a hidden field to a user profile via `update()`.
11. **Blanket Query**: Authenticated user attempts a collection group query on all user PII.
12. **Email Spoofing**: Attempt to gain admin access with an unverified email matching an admin list.

## 3. Test Runner (Mock)
A real `firestore.rules` will be implemented to reject these.
