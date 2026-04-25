from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Category, Product, CartItem, Order, OrderItem, Profile, Favorite

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price_at_purchase')
    can_delete = False

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    fields = ('phone', 'gender')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'id')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'brand', 'category', 'price', 'discount_price', 'in_stock', 'stock')
    list_filter = ('category', 'brand', 'in_stock')
    search_fields = ('title', 'brand', 'description')
    list_editable = ('price', 'discount_price', 'in_stock', 'stock')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'added_at')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_link', 'phone', 'email', 'total_price', 'status', 'get_payment_method_display', 'created_at')
    list_filter = ('status', 'payment_method', 'delivery_method', 'created_at')
    search_fields = ('phone', 'email', 'delivery_address', 'user__username', 'user__first_name', 'user__last_name')
    list_editable = ('status',)
    readonly_fields = ('user', 'phone', 'email', 'delivery_address', 'total_price', 'payment_method', 'delivery_method', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    exclude = ('comment',)
    def user_link(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name} ({obj.user.username})"
        return "—"
    user_link.short_description = 'Покупатель'
    def get_payment_method_display(self, obj):
        return obj.get_payment_method_display()
    get_payment_method_display.short_description = 'Способ оплаты'

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')

admin.site.unregister(User)
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_phone', 'get_gender', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile__gender')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'profile__phone')
    ordering = ('-date_joined',)
    inlines = [ProfileInline]
    def get_phone(self, obj):
        return obj.profile.phone if hasattr(obj, 'profile') and obj.profile.phone else '—'
    get_phone.short_description = 'Телефон'
    get_phone.admin_order_field = 'profile__phone'
    def get_gender(self, obj):
        if hasattr(obj, 'profile') and obj.profile.gender:
            return 'Мужской' if obj.profile.gender == 'male' else 'Женский'
        return '—'
    get_gender.short_description = 'Пол'
    get_gender.admin_order_field = 'profile__gender'
    fieldsets = BaseUserAdmin.fieldsets + (('Профиль', {'fields': ()}),)