from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (Category, Product, CartItem, Order, OrderItem, Profile)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price_at_purchase')
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_link', 'total_price', 'is_paid', 'created_at')
    list_filter = ('is_paid', 'created_at')
    list_editable = ('is_paid',)
    inlines = [OrderItemInline]

    def user_link(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name} ({obj.user.username})" if obj.user else "—"
    user_link.short_description = 'Покупатель'

admin.site.unregister(User)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    ordering = ('-date_joined',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'id')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'brand', 'category', 'price', 'discount_price', 'in_stock')
    list_filter = ('category', 'brand', 'in_stock')
    search_fields = ('title', 'brand', 'description')
    list_editable = ('price', 'discount_price', 'in_stock')
    list_per_page = 20

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'added_at')